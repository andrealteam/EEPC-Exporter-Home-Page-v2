import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  getLiveHeader,
  getMessages,
  postMessages,
} from "../../services/liveApi";
import { baseFileURL } from "../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faPaperPlane,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import CryptoJS from "crypto-js";

const secretKey = "my-secret-key";

const ChatWidget = ({ website_url, isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);
  const messagesEndRef = useRef(null);
  const [msgNotificationLength, setMsgNotificationLength] = useState(0);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const {
    data: headerData,
    isLoading,
    isError,
    error: headerError,
  } = useQuery({
    queryKey: ["header-chat-live", website_url],
    queryFn: () => getLiveHeader(website_url),
  });

  const {
    data: msgs,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["msgs-get", data],
    queryFn: () => getMessages(email, website_url),
    enabled: !!data && isOpen, // ✅ Only fetch when isOpen is true
    refetchInterval: isOpen ? 5000 : false, // ✅ Poll only when chat is open
  });

  const { data: msgsData } = useQuery({
    queryKey: ["msg-for-notification", email, isOpen],
    enabled: !!email,
    queryFn: () => getMessages(email, website_url),
    refetchInterval: 20000,
  });

  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem(`chat-user`);
      if (storedData) {
        try {
          const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
          const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
          if (decryptedText) {
            const decryptedData = JSON.parse(decryptedText);
            setName(decryptedData.name || "");
            setEmail(decryptedData.email || "");
            setPhone(decryptedData.phone || "");
            setData(decryptedData.name || "");
          }
        } catch (error) {
          console.error("❌ Error decrypting chat-user data:", error);
        }
      }
    };

    // Load initially
    loadData();

    // Add listener
    window.addEventListener("localStorageUpdated", loadData);

    return () => {
      window.removeEventListener("localStorageUpdated", loadData);
    };
  }, [website_url, refresh]);

  // Store latest message count when chat is open
  useEffect(() => {
    if (msgs?.length > 0 && isOpen) {
      localStorage.setItem(`${website_url}-msg`, msgs.length);
    }
  }, [msgs, isOpen]);

  // Calculate notification badge count
  useEffect(() => {
    const lastMsgLength =
      parseInt(localStorage.getItem(`${website_url}-msg`)) || 0;

    if (isOpen) {
      // No badge when chat is open
      setMsgNotificationLength(0);
    } else {
      const diff = (msgsData?.length || 0) - lastMsgLength;
      setMsgNotificationLength(diff > 0 ? diff : 0);
    }
  }, [msgsData, isOpen]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && data && isOpen) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [data, isOpen]);

  const safeMsgs = Array.isArray(msgs) ? msgs : [];
  
  useEffect(() => {
    if (isSuccess && msgs && headerData?.name) {
      setMessages([
        {
          from_user: "member",
          message: `Hey there, welcome to ${headerData.name}! How can I help you today? 😊`,
          updated_at: Date.now(),
        },
        ...safeMsgs,
      ]);
    }
  }, [msgs, isSuccess, headerData]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    // Don't allow admin to open chat
    if (isAdmin) return;
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    // Basic email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }
    
    // Handle form submission logic here
    const data = { name, email, phone };

    // Encrypt before saving
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();

    localStorage.setItem("chat-user", encrypted);
    window.dispatchEvent(new Event("localStorageUpdated"));

    // Reset form fields
    setName("");
    setEmail("");
    setPhone("");

    // Trigger useEffect again
    setRefresh((prev) => !prev);
  };

  const handleSend = async () => {
    // Don't allow admin to send messages
    if (isAdmin) return;
    
    const text = message.trim();
    if (!text) return;

    // Show user message instantly
    setMessages((prev) => [
      ...prev,
      { from_user: "user", message: text, updated_at: Date.now() },
    ]);
    setMessage(""); // clear input

    try {
      const res = await postMessages(
        { name, phone, email, message: text, from_user: "user" },
        website_url
      );

      if (res.status) {
        refetch(); // optional: refresh chat from server
      }
    } catch (error) {
      console.error("Send error:", error);
      setMessages((prev) => [
        ...prev,
        {
          from_user: "member",
          message: "Error sending message. Please try again.",
          updated_at: Date.now(),
        },
      ]);
    }
  };

  function logout() {
    localStorage.removeItem(website_url);
    setName("");
    setEmail("");
    setPhone("");
    setData("");
    setMessages([]);
  }

  // Optional: log error or loading
  if (isLoading) return null; // Wait silently (render nothing)
  if (isError) {
    console.error("Header fetch error:", headerError);
    return null; // Or show an error UI if needed
  }

  // If data is not available (null/undefined), don't render
  if (!headerData) return null;

  return (
    <div className="chat-container">
      {!isOpen ? (
        <div className="chat-popup" onClick={toggleChat}>
          <div className="chat-message">
            <p className="chat-text">We're Online!</p>
            <p className="chat-subtext">How may I help you today?</p>
          </div>
          <div className="chat-icon" style={{ position: "relative" }}>
            <button 
              className="chat-button" 
              onClick={toggleChat}
              disabled={isAdmin}
              title={isAdmin ? "Chat is disabled for admin" : "Chat with us"}
            >
              {!isAdmin && msgNotificationLength > 0 && (
                <span className="notification-badge">{msgNotificationLength}</span>
              )}
              <FontAwesomeIcon 
                icon={faCommentDots} 
                size="lg" 
                style={{ 
                  opacity: isAdmin ? 0.5 : 1, 
                  cursor: isAdmin ? 'not-allowed' : 'pointer' 
                }}
              />
            </button>
            {!isAdmin && msgNotificationLength > 0 && (
              <span
                className="notification-badge"
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "3px 6px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  lineHeight: 1,
                }}
              >
                {msgNotificationLength}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          {data ? (
            <>
              <div
                className="chat-toggle-floating"
                onClick={toggleChat}
              >
                <FontAwesomeIcon icon={faChevronDown} />
              </div>
              <div className="chat-box">
                <div className="chat-header">
                  <div
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={baseFileURL + headerData?.logo}
                      alt="Logo"
                      width="40"
                      style={{ borderRadius: "50%" }}
                    />
                    <div style={{ marginLeft: "8px" }}>
                      <div className="chat-subtitle">{headerData?.name}</div>
                    </div>
                  </div>
                </div>
                <div className="chat-body">
                  {messages.length < 1 && <div className="loader"></div>}
                  <div className="chat-info-banner">
                    Our team will respond to your queries shortly. We appreciate
                    your patience in the meantime.
                  </div>

                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`chat-msg ${
                        msg.from_user === "user" ? "user-msg" : "bot-msg"
                      }`}
                    >
                      <div>{msg?.message}</div>
                      <div className="msg-time">
                        {new Date(msg.updated_at).toLocaleString("en-US", {
                          day: "2-digit",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Auto-scroll ref */}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message and hit 'Enter'"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !isAdmin &&
                        message.trim() !== ""
                      ) {
                        handleSend();
                      }
                    }}
                    className="input chat-input"
                    disabled={isAdmin}
                    style={{
                      backgroundColor: isAdmin ? "#f5f5f5" : "white",
                      cursor: isAdmin ? "not-allowed" : "text",
                      opacity: isAdmin ? 0.7 : 1,
                    }}
                  />

                  <span
                    className="send-icon"
                    onClick={() => {
                      if (!isAdmin && message.trim() !== "") handleSend();
                    }}
                    style={{
                      cursor: isAdmin ? "not-allowed" : "pointer",
                      color: isAdmin ? "#aaa" : "#0195a3",
                      opacity: isAdmin ? 0.6 : 1,
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </span>

                  {isAdmin && (
                    <h6
                      style={{
                        color: "red",
                        marginTop: "5px",
                        fontSize: "13px",
                      }}
                    >
                      You can’t send messages as an admin.
                    </h6>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className="chat-toggle-floating"
                onClick={toggleChat}
              >
                <FontAwesomeIcon icon={faChevronDown} />
              </div>
              <div className="chat-box">
                <div className="chat-header" onClick={toggleChat}>
                  {headerData?.logo && (
                    <img
                      src={baseFileURL + headerData?.logo}
                      alt="Logo"
                      width="40"
                      height="40"
                      style={{ borderRadius: "50%" }}
                    />
                  )}

                  <div style={{ marginLeft: "8px" }}>
                    <div className="chat-subtitle">{headerData?.name}</div>
                  </div>
                </div>

                <div className="chat-form">
                  <input
                    type="text"
                    placeholder="Enter Full Name (required)"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isAdmin}
                  />
                  <input
                    type="email"
                    placeholder="Enter Your Email Address (required)"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isAdmin}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number (optional)"
                    className="input"
                    disabled={isAdmin}
                  />

                  <div className="btn-group">
                    <button 
                      className="continue-btn" 
                      onClick={handleSubmit}
                      disabled={isAdmin}
                      style={{
                        opacity: isAdmin ? 0.7 : 1,
                        cursor: isAdmin ? "not-allowed" : "pointer"
                      }}
                    >
                      Continue
                    </button>
                  </div>
                  
                  {isAdmin && (
                    <h6
                      style={{
                        color: "red",
                        marginTop: "10px",
                        fontSize: "13px",
                        textAlign: "center"
                      }}
                    >
                      Chat is disabled for admin users.
                    </h6>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatWidget;