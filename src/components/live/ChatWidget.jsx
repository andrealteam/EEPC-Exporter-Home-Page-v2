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
      const storedData = localStorage.getItem(`chat-user`);
      if (storedData) {
        const decryptedBytes = CryptoJS.AES.decrypt(storedData, secretKey);
        const decryptedData = JSON.parse(
          decryptedBytes.toString(CryptoJS.enc.Utf8)
        );
        // const parsedData = JSON.parse(storedData);
        setName(decryptedData.name || "");
        setEmail(decryptedData.email || "");
        setPhone(decryptedData.phone || "");
        setData(decryptedData.name || "");
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
  
  // Don't show chat widget for admin users
  if (isAdmin) {
    return (
      <div className="chat-widget">
        <div className="admin-chat-message">
          <p>Chat is not available for admin users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-box">
          {/* Chat box content */}
        </div>
      ) : (
        <div className="chat-popup" onClick={toggleChat}>
          <div className="chat-message">
            <p className="chat-text">We're Online!</p>
            <p className="chat-subtext">How may I help you today?</p>
          </div>
          <div className="chat-icon">
            <FontAwesomeIcon icon={faCommentDots} size="lg" />
          </div>
        </div>
      )}
    </div>
  );
}