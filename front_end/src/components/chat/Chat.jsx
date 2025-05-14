import React, { useState, useEffect } from "react";
import "./Chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import ChatBetweenUsers from "../ChatBetweenUsers/ChatBetweenUsers";
import axios from "axios";
import { useUser } from "../Context";

import Loading_input from "../Loading_input/Loading_input";

const Chat = () => {
  const { setUserById } = useUser();
  const { userTheme, setUserTheme } = useUser();
  const [cookies] = useCookies(["token"]);

  const [activeTab, setActiveTab] = useState("Primary");
  const { showChat, setShowChat } = useUser();
  const [sentRequests, setSentRequests] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [myData, setMyData] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [folloRequests, setfollRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [reloadToggle, setReloadToggle] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [load, setLoad] = useState(false);
  const [loadid, setLoadid] = useState("");

  const [reqLoading, setReqLoading] = useState(false);
const [reqLoadingId, setReqLoadingId] = useState(null);
const [rejectedIds, setRejectedIds] = useState([]);


  // =============================================

  const Navigate = useNavigate();

  // ====================================================

  const API = "http://localhost:8000/api/v2";

  const headers = {
    headers: { Authorization: `Bearer ${cookies.token}` },
  };

  useEffect(() => {
    document.body.classList.add("chat-page");
    return () => document.body.classList.remove("chat-page");
  }, []);

  useEffect(() => {
    // Check if we have cached data and it's not expired (less than 5 minutes old)
    const cachedData = JSON.parse(localStorage.getItem("chatData"));
    const cachedTime = localStorage.getItem("chatDataTimestamp");
    const currentTime = new Date().getTime();
    const isDataFresh = cachedTime && currentTime - cachedTime < 5 * 60 * 1000;

    if (cachedData && isDataFresh && !loadingRequests) {
      // Use cached data if it exists and is fresh
      setMyData(cachedData);
      setFriendRequests(cachedData.Friend_requests);
      setFriends(cachedData.friends);
      setfollRequests(cachedData.followers);
      setLoadingRequests(false);
    } else {
      // Fetch new data if no cache or cache is stale
      axios
        .get(`${API}/auth/get_date_my`, headers)
        .then((res) => {
          const data = res.data.data;
          setMyData(data);
          setFriendRequests(data.Friend_requests);
          setFriends(data.friends);
          console.log();

          // Cache the data
          localStorage.setItem("chatData", JSON.stringify(data));
          localStorage.setItem("chatDataTimestamp", currentTime.toString());
        })
        .catch(console.error)
        .finally(() => setLoadingRequests(false));
    }
  }, [cookies.token, loadingRequests ,reloadToggle]); // Only depend on token and explicit reloads

  // useEffect(() => {
  //   if (searchTerm.trim() === '') {
  //     setAllUsers([]);
  //     return;
  //   }

  //   const delayDebounce = setTimeout(() => {
  //     // Check if we have cached search results for this term
  //     const cachedSearches = JSON.parse(localStorage.getItem('chatSearches') || '{}');

  //     if (cachedSearches[searchTerm]) {
  //       setAllUsers(cachedSearches[searchTerm]);
  //     } else {
  //       axios.get(`${API}/user?name=${searchTerm}`, headers)
  //         .then(res => {
  //           const results = res.data.data;
  //           setAllUsers(results);
  //           console.log(results);

  //           // Cache the search results
  //           const updatedCache = { ...cachedSearches, [searchTerm]: results };
  //           localStorage.setItem('chatSearches', JSON.stringify(updatedCache));
  //         })
  //         .catch(console.error);
  //     }
  //   }, 400);

  //   return () => clearTimeout(delayDebounce);
  // }, [searchTerm, cookies.token]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      axios
        .get(`${API}/user?name=${searchTerm}`, headers)
        .then((res) => {
          setAllUsers(res.data.data);
          setLoad(false)
              setReqLoading(false);
    setReqLoadingId(null);
        })
        .catch(console.error);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, sentRequests , reloadToggle]);

  useEffect(() => {
    const savedRequests =
      JSON.parse(localStorage.getItem("sentRequests")) || {};
    setSentRequests(savedRequests);
  }, []);

  const sendFriendRequest = (id) => {
    setLoad(true);
    axios
      .post(`${API}/auth/Send_friend_request/${id}`, {}, headers)
      .then(() => {
        setReloadToggle((prev) => !prev);
      })
      .catch(console.error);
  };

  const handleSendRequest = (id) => {
    sendFriendRequest(id);
    const updated = { ...sentRequests, [id]: true };
    setSentRequests(updated);
    // localStorage.setItem('sentRequests', JSON.stringify(updated));
  };

  // const acceptRequest = (id) => {
  //   axios
  //     .post(`${API}/auth/Accept_friend_request/${id}`, {}, headers)
  //     .then(() => setLoadingRequests((prev) => !prev))
  //     .catch(console.error);
  // };

  // const rejectRequest = (id) => {
  //   axios
  //     .post(`${API}/auth/Reject_friend_request/${id}`, {}, headers)
  //     .then(() => {
  //       setReloadToggle((prev) => !prev);
  //     })
  //     .catch(console.error);
  // };

  const acceptRequest = async (id) => {
  setReqLoading(true);
  setReqLoadingId(id);
  try {
    await axios.post(`${API}/auth/Accept_friend_request/${id}`, {}, headers);
    setLoadingRequests(prev => !prev);
  } catch (err) {
    console.error(err);
  } finally {
    // setReqLoading(false);
    // setReqLoadingId(null);
  }
};

const rejectRequest = async (id) => {
  setReqLoading(true);
  setReqLoadingId(id);
  try {
    await axios.post(`${API}/auth/Reject_friend_request/${id}`, {}, headers);
    setRejectedIds(prev => [...prev, id]);
    setReloadToggle(prev => !prev);
  } catch (err) {
    console.error(err);
  } finally {
    // setReqLoading(false);
    // setReqLoadingId(null);
  }
};


  // ============================================================

  useEffect(() => {
    const ff = localStorage.getItem("theme");
    if (ff === "dark") {
      setUserTheme(true);
    } else {
      setUserTheme(false);
    }
  }, [userTheme]);

  // ============================================================
  return (
    <div className="chat">
      <div className="test">
        <h2>Messages</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <FontAwesomeIcon className="search_icon" icon={faSearch} />
          <input
            type="text"
            placeholder="search for people.."
            value={searchTerm}
            onFocus={() => setSearchTerm("")}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="request">
          {["Primary", "General", "Requests"].map((tab) => (
            <p
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </p>
          ))}
        </div>
      </div>

      {activeTab === "Primary" && !showChat && (
        <div className="friends">
          {friends?.length ? (
            friends.map(({ friend }, i) => (
              <div
                className="friend"
                key={i}
                onClick={() => {
                  setShowChat(true);
                  setUserById(friend);
                }}
              >
                <img
                  src={
                    friend?.profilImage
                      ? friend.profilImage.startsWith("http")
                        ? friend.profilImage
                        : `http://localhost:8000/user/${friend.profilImage}`
                      : "/image/pngegg.png"
                  }
                  alt={`Image of ${friend?.name}`}
                />
                <p>{friend?.name}</p>
              </div>
            ))
          ) : (
            <img
              style={{ margin: "auto", width: "70%" }}
              src={
                userTheme
                  ? "/image/no-friend-requests-found (2).png"
                  : "/image/no-friend-requests-found (1).png"
              }
            />
          )}
        </div>
      )}

      {showChat && <ChatBetweenUsers />}

      {activeTab === "Requests" && (
        <div className="the_requset">
          {friendRequests?.length ? (
            friendRequests.map(({ friend }, i) => (
              <div className="req" key={i}>
                <div className="img_req">
                  <img
                    src={
                      friend.profilImage
                        ? friend.profilImage.startsWith("http")
                          ? friend.profilImage
                          : `http://localhost:8000/user/${friend.profilImage}`
                        : "/image/pngegg.png"
                    }
                    alt={`Image of ${friend.name}`}
                  />
                  <p>{friend.name}</p>
                </div>
                <div className="accept">
                  <button onClick={() => rejectRequest(friend._id)}>
                    Reject
                  </button>
                  <button onClick={() => acceptRequest(friend._id)}>
                    Accept
                  </button>
                </div>
              </div>
            ))
          ) : (
            <img
              style={{ margin: "auto", width: "70%" }}
              src={
                userTheme
                  ? "/image/no-friendship-requests (1).png"
                  : "/image/no-friendship-requests.png"
              }
            />
          )}
        </div>
      )}

      {activeTab === "General" && (
        <div className="general">
          {allUsers?.length ? (
            allUsers
              .filter((user) => user._id !== myData?._id) // تصفية المستخدم الذي يتوافق مع myData
              .map((user, i) => (
                <div key={i} className="req">
                  <div
                    className="img_req"
                    onClick={() => Navigate(`/Get_Shoole_By/${user._id}`)}
                  >
                    {/* {console.log(user)} */}
                    <img
                      src={
                        user.profilImage
                          ? user.profilImage.startsWith("http")
                            ? user.profilImage
                            : `http://localhost:8000/user/${user.profilImage}`
                          : "/image/pngegg.png"
                      }
                      alt={`Image of ${user.name}`}
                    />
                    <p>{user.name}</p>
                  </div>
                  <div className="accept">
                    {friends.some((f) => f.friend?._id === user?._id) ? (
                      <p>Friends</p>
                    ) : null}
                    {friendRequests.some((f) => f.friend._id === user._id) ? (
                      <div className="accept_G">
                        {rejectedIds.includes(user._id) ? (
                          <p style={{ fontStyle: 'italic', color: 'gray' }}>Request rejected</p>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                rejectRequest(user._id);
                              }}
                              disabled={reqLoading && reqLoadingId === user._id}
                              style={{
                                opacity: reqLoading && reqLoadingId === user._id ? 0.3 : 1,
                                pointerEvents: reqLoading && reqLoadingId === user._id ? 'none' : 'auto',
                                position: "relative",
                              }}
                            >
                              Reject
                              {reqLoading && reqLoadingId === user._id ? (
                                <div className="load" style={{ position: "absolute", right: 10 }}>
                                  <Loading_input />
                                </div>
                              ) : null}
                            </button>

                            <button
                              onClick={() => {
                                acceptRequest(user._id);
                                setReqLoadingId(user._id);
                              }}
                              disabled={reqLoading && reqLoadingId === user._id}
                              style={{
                                opacity: reqLoading && reqLoadingId === user._id ? 0.3 : 1,
                                pointerEvents: reqLoading && reqLoadingId === user._id ? 'none' : 'auto',
                                position: "relative",
                              }}
                            >
                              Accept
                              {reqLoading && reqLoadingId === user._id ? (
                                <div className="load" style={{ position: "absolute", right: 10 }}>
                                  <Loading_input />
                                </div>
                              ) : null}
                            </button>
                          </>
                        )}
                      </div>

                    ) : null}
                    {user.Friend_requests.some(
                      (f) => f.friend === myData?._id
                    ) ? (
                      <p>You have sent a friend request</p>
                    ) : null}
                    {user.followers.some((f) => f.friend === myData?._id) ? (
                      <p>Follower</p>
                    ) : null}
                    {!friends.some((f) => f.friend?._id === user?._id) &&
                    !friendRequests.some((f) => f.friend._id === user._id) &&
                    !user.Friend_requests.some(
                      (f) => f.friend === myData?._id
                    ) &&
                    !user.followers.some((f) => f.friend === myData?._id) ? (
                      <button
                        onClick={() => {
                          handleSendRequest(user._id);
                          setLoadid(user._id);
                        }}
                        disabled={load && loadid === user._id}
                        style={{
                          opacity: load && loadid === user._id ? 0.3 : 1,
                          pointerEvents:
                            load && loadid === user._id ? "none" : "auto",
                          position: "relative",
                        }}
                      >
                        {user.role === "employee" ? "Follow" : "Add a friend"}
                        {load && loadid === user._id ? (
                          <div
                            className="load"
                            style={{ position: "absolute", right: 10 }}
                          >
                            <Loading_input />
                          </div>
                        ) : null}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
          ) : (
            <p>No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
