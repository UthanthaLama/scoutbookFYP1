import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/conversation.css';

export default function ConversationView({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversation();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`https://scoutbookfyp1.onrender.com/api/messages/conversations/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load conversation');
      }

      const data = await response.json();
      console.log('Conversation data loaded:', data);
      setConversation(data.conversation);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`https://scoutbookfyp1.onrender.com/api/messages/conversations/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const message = await response.json();
      setMessages(prev => [...prev, {
        ...message,
        sender_name: user.name,
        sender_email: user.email
      }]);
      setNewMessage('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      'recruitment_inquiry': 'Recruitment Inquiry',
      'trial_invitation': 'Trial Invitation',
      'performance_clarification': 'Performance Clarification',
      'contract_discussion': 'Contract Discussion',
      'response_to_scout': 'Response to Scout'
    };
    return labels[purpose] || purpose;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = new Date(message.created_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {});

  // ── FIX: support both user.userId and user.id ──
  const currentUserId = user.userId || user.id;

  const otherPersonName = user.role === 'scout'
    ? conversation?.player_name
    : conversation?.scout_name;

  const otherPersonPicture = user.role === 'scout'
    ? conversation?.player_picture
    : conversation?.scout_picture;

  const currentUserPicture = user.profile_picture || (user.role === 'scout'
    ? conversation?.scout_picture
    : conversation?.player_picture);

  const otherPersonInitial = (otherPersonName || 'U')?.charAt(0).toUpperCase();
  const currentUserInitial = (user.name || user.email || 'U')?.charAt(0).toUpperCase();
  const otherPersonRole = user.role === 'scout' ? 'Player' : 'Scout';

  if (loading) {
    return (
      <div className="conv-wrapper">
        <div className="conv-loading">
          <div className="conv-spinner" />
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="conv-wrapper">
        <div className="conv-error">
          <span className="material-icons">error_outline</span>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/messages')}>Back to Messages</button>
        </div>
      </div>
    );
  }

  const canSendMessages = conversation &&
    !conversation.status.includes('blocked') &&
    conversation.status !== 'closed';

  return (
    <div className="conv-wrapper">

      {/* ── Top Profile Header ─────────────────────── */}
      <div className="conv-header">
        <button className="conv-back-btn" onClick={() => navigate('/messages')}>
          <span className="material-icons">arrow_back</span>
        </button>

        <div className="conv-header-avatar">
          {otherPersonPicture ? (
            <img src={otherPersonPicture} alt={otherPersonName} />
          ) : (
            otherPersonInitial
          )}
          <span className="conv-online-dot" />
        </div>

        <div className="conv-header-info">
          <h2 className="conv-header-name">{otherPersonName}</h2>
          <span className="conv-header-role">{otherPersonRole} · {getPurposeLabel(conversation.purpose)}</span>
        </div>

        <div className="conv-header-actions">
          <button className="conv-icon-btn" title="Call">
            <span className="material-icons">call</span>
          </button>
          <button className="conv-icon-btn" title="Video call">
            <span className="material-icons">videocam</span>
          </button>
          <button className="conv-icon-btn" title="Info">
            <span className="material-icons">info_outline</span>
          </button>
        </div>
      </div>

      {/* ── Messages Area ──────────────────────────── */}
      <div className="conv-messages-area">

        {/* Profile card shown at top of conversation */}
        <div className="conv-profile-card">
          <div className="conv-profile-card-avatar">
            {otherPersonPicture ? (
              <img src={otherPersonPicture} alt={otherPersonName} />
            ) : (
              otherPersonInitial
            )}
          </div>
          <h3 className="conv-profile-card-name">{otherPersonName}</h3>
          <p className="conv-profile-card-role">{otherPersonRole}</p>
          <p className="conv-profile-card-note">
            This is the beginning of your conversation with {otherPersonName}.
          </p>
        </div>

        {/* Messages grouped by date */}
        {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
          <div key={dateKey} style={{ width: '100%' }}>
            {/* Date separator */}
            <div className="conv-date-separator">
              <span>{formatDate(dayMessages[0].created_at)}</span>
            </div>

            {/* Messages */}
            {dayMessages.map((message, index) => {
              // ── FIX: use currentUserId instead of user.userId directly ──
              const isOwn = String(message.sender_id) === String(currentUserId);

              const prevMsg = dayMessages[index - 1];
              const nextMsg = dayMessages[index + 1];
              const isFirstInGroup = !prevMsg || prevMsg.sender_id !== message.sender_id;
              const isLastInGroup  = !nextMsg || nextMsg.sender_id !== message.sender_id;

              const messageSenderPicture = message.sender_id === conversation.scout_id
                ? conversation.scout_picture
                : conversation.player_picture;

              const messageSenderName = message.sender_id === conversation.scout_id
                ? conversation.scout_name
                : conversation.player_name;

              const messageSenderInitial = messageSenderName?.charAt(0).toUpperCase() || '?';

              return (
                <div
                  key={message.id}
                  className={`conv-message-row ${isOwn ? 'own' : 'other'} ${isLastInGroup ? 'last-in-group' : ''}`}
                >
                  {/* Avatar for received messages */}
                  {!isOwn && (
                    <div className={`conv-msg-avatar ${isLastInGroup ? 'visible' : 'hidden'}`}>
                      {messageSenderPicture ? (
                        <img src={messageSenderPicture} alt={messageSenderName} />
                      ) : (
                        messageSenderInitial
                      )}
                    </div>
                  )}

                  <div className="conv-bubble-wrap">
                    {/* Sender name for received messages (first in group) */}
                    {!isOwn && isFirstInGroup && (
                      <span className="conv-sender-name">{messageSenderName}</span>
                    )}

                    <div
                      className={`conv-bubble ${isOwn ? 'own' : 'other'} ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}
                    >
                      <span className="conv-bubble-text">{message.content}</span>
                    </div>

                    {/* Timestamp shown on last message in group */}
                    {isLastInGroup && (
                      <span className={`conv-timestamp ${isOwn ? 'own' : 'other'}`}>
                        {formatTime(message.created_at)}
                        {isOwn && (
                          <span className="conv-read-status">
                            <span className="material-icons">done_all</span>
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Avatar for sent messages */}
                  {isOwn && (
                    <div className={`conv-msg-avatar ${isLastInGroup ? 'visible' : 'hidden'}`}>
                      {currentUserPicture ? (
                        <img src={currentUserPicture} alt={user.name} />
                      ) : (
                        currentUserInitial
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="conv-no-messages">
            <span className="material-icons">chat_bubble_outline</span>
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ─────────────────────────────── */}
      {canSendMessages ? (
        <form className="conv-input-area" onSubmit={sendMessage}>
          {error && <div className="conv-error-bar">{error}</div>}
          <div className="conv-input-row">
            <button type="button" className="conv-attach-btn" title="Attach">
              <span className="material-icons">add_circle</span>
            </button>

            <div className="conv-textarea-wrap">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Aa"
                maxLength={500}
                rows={1}
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
            </div>

            <button
              type="submit"
              className={`conv-send-btn ${newMessage.trim() ? 'active' : ''}`}
              disabled={!newMessage.trim() || sending}
              title="Send"
            >
              <span className="material-icons">send</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="conv-disabled-bar">
          <span className="material-icons">block</span>
          <p>
            {conversation.status === 'closed'   && 'This conversation has been closed.'}
            {conversation.status.includes('blocked') && 'This conversation has been blocked.'}
            {conversation.status === 'pending'  && 'This conversation is pending approval.'}
          </p>
        </div>
      )}
    </div>
  );
}
