import { useQuery } from "@tanstack/react-query";
import React, { use, useEffect, useRef, useState } from "react";
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

const ChatWidget = ({ website_url, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [data, setData] = useState("");
  const [refresh, setRefresh] = useState(false);
  const messagesEndRef = useRef(null);
  const [msgNotificationLength, setMsgNotificationLength] = useState(0);

  const [messages, setMessages] = useState([
    // {
    //   from_user: "member",
    //   text: "Hey there, welcome to Chegg! How can I help you today? 😊",
    //   updated_at: Date.now(),
    // },
  ]);
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
      try {
        const storedData = localStorage.getItem(`chat-user`);
        if (storedData) {
          const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
          const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
          
          // Check if decrypted text is not empty before parsing
          if (decryptedText) {
            const decryptedData = JSON.parse(decryptedText);
            setName(decryptedData.name || "");
            setEmail(decryptedData.email || "");
            setPhone(decryptedData.phone || "");
            setData(decryptedData.name || "");
          } else {
            console.warn('Decrypted data is empty');
          }
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
        // Clear invalid data from localStorage
        localStorage.removeItem(`chat-user`);
        setName("");
        setEmail("");
        setPhone("");
        setData("");
      }
    };

    // pehle load
    loadData();

    // listener lagao
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
      const diff = msgs?.length - lastMsgLength;
      setMsgNotificationLength(0); // No badge when chat is open
    } else {
      const diff = msgsData?.length - lastMsgLength;
      if (diff > 0) {
        setMsgNotificationLength(diff);
      } else {
        setMsgNotificationLength(0);
      }
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
  // ✅ include isOpen in deps
  const safeMsgs = Array.isArray(msgs) ? msgs : [];
  useEffect(() => {
    if (isSuccess && msgs) {
      setMessages([
        {
          from_user: "member",
          message: `Hey there, welcome to ${headerData?.name}! How can I help you today? 😊`,
          updated_at: Date.now(),
        },
        ...safeMsgs,
      ]);
    }
  }, [msgs, isSuccess]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
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

    // localStorage.setItem(`chat-user`, JSON.stringify({ name, email, phone }));

    window.dispatchEvent(new Event("localStorageUpdated"));

    // Reset form fields
    setName("");
    setEmail("");
    setPhone("");

    // Trigger useEffect again
    setRefresh((prev) => !prev);
  };

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    // Show user message instantly
    setMessages((prev) => [
      ...prev,
      { from_user: "user", text, updated_at: Date.now() },
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
          text: "Error sending message. Please try again.",
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
            <FontAwesomeIcon icon={faCommentDots} size="lg" />

            {msgNotificationLength > 0 && (
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
                // onClick={() => setChatStep(1)}
              >
                <FontAwesomeIcon icon={faChevronDown} />
                {/* ⌄ */}
              </div>
              <div className="chat-box">
                <div className="chat-header">
                  <div
                    // onClick={toggleChat}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* <span className="chat-avatar">C</span> */}
                    <img
                      src={baseFileURL + headerData?.logo}
                      alt="Logo"
                      width="40"
                      style={{ borderRadius: "50%" }}
                    />
                    <div style={{ marginLeft: "8px" }}>
                      {/* <div className="chat-title">Cea</div> */}
                      <div className="chat-subtitle">{headerData?.name}</div>
                    </div>
                  </div>

                  {/* <button className="logout-btn" onClick={logout}>
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      width={20}
                      style={{ height: "16px" }}
                    />
                  </button> */}
                </div>
                <div className="chat-body">
                  {messages.length < 1 && <div class="loader"></div>}
                  <div class="chat-info-banner">
                    {/* <span class="chat-lock-icon">🔒</span> */}
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

                  {/* ✅ Only show if first user message sent (assuming welcome + user message = 2) */}
                  {/* {messages.length === 2 &&
                    messages[1]?.from_user === "user" && (
                      <div className="chat-msg bot-msg">
                        {`Thank you for reaching out to us and sharing your enquiry. Our team will review your query and respond with an appropriate answer shortly. You will also receive a copy of the response on your registered email address. We appreciate your patience in the meantime.`}
                      </div>
                    )} */}

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
                      backgroundColor: isAdmin ? "" : "",
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
                // onClick={() => setChatStep(1)}
              >
                <FontAwesomeIcon icon={faChevronDown} />
                {/* ⌄ */}
              </div>
              <div className="chat-box">
                <div className="chat-header" onClick={toggleChat}>
                  {/* <span className="chat-avatar">C</span> */}
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
                    {/* <div className="chat-title">Cea</div> */}
                    <div className="chat-subtitle">{headerData?.name}</div>
                  </div>
                  {/* <span className="chat-toggle">⬇</span> */}
                </div>

                <div className="chat-form">
                  <input
                    type="text"
                    placeholder="Enter Full Name (required)"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Enter Your Email Address (required)"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number (optional)"
                    className="input"
                  />

                  <div className="btn-group">
                    <button className="continue-btn" onClick={handleSubmit}>
                      Continue
                    </button>
                  </div>
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