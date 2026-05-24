import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/messages.css';

export default function Messages({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingScoutId, setProcessingScoutId] = useState(null);

  console.log('Messages component rendered with user:', user);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading conversations for user:', user);
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to load conversations:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to load conversations');
      }
      
      const data = await response.json();
      console.log('Conversations loaded:', data);
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      alert(`Error loading conversations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScoutIdParam = useCallback(async (scoutId) => {
    setProcessingScoutId(scoutId);
    
    try {
      console.log('handleScoutIdParam called with scoutId:', scoutId);
      console.log('Current user:', user);
      console.log('Current conversations:', conversations);
      
      // Validate scoutId
      const scoutIdNum = parseInt(scoutId);
      if (isNaN(scoutIdNum) || scoutIdNum <= 0) {
        console.error('Invalid scoutId:', scoutId);
        alert('Invalid scout ID');
        setProcessingScoutId(null);
        return;
      }
      
      // Check if conversation already exists with this scout
      const existingConversation = conversations.find(
        conv => {
          // If current user is a player, check if scout_id matches
          if (user.role === 'player') {
            return conv.scout_id === scoutIdNum;
          }
          // If current user is a scout, check if player_id matches
          return conv.player_id === scoutIdNum;
        }
      );

      if (existingConversation) {
        // Navigate to existing conversation
        console.log('Found existing conversation:', existingConversation.id);
        navigate(`/messages/${existingConversation.id}`, { replace: true });
        setProcessingScoutId(null);
        return;
      }

      // Create new conversation with the scout
      console.log('Creating new conversation with scout:', scoutIdNum);
      console.log('User role:', user.role);
      console.log('User ID:', user.id);
      
      const requestBody = {
        recipientId: scoutIdNum,
        purpose: 'response_to_scout'
      };
      console.log('Request body:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody));
      console.log('Token:', localStorage.getItem('sb_token'));
      
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create conversation:', response.status, errorData);
        console.error('Full error response:', errorData);
        alert(`Error creating conversation: ${errorData.error || 'Unknown error'}`);
        setProcessingScoutId(null);
        return;
      }

      const newConversation = await response.json();
      console.log('New conversation created:', newConversation);
      
      if (newConversation && newConversation.id) {
        // Add a small delay to ensure the conversation is fully committed to DB
        await new Promise(resolve => setTimeout(resolve, 200));
        navigate(`/messages/${newConversation.id}`, { replace: true });
      } else {
        console.error('No conversation ID in response');
        alert('Failed to create conversation: No ID returned');
      }
    } catch (error) {
      console.error('Error in handleScoutIdParam:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingScoutId(null);
    }
  }, [conversations, navigate]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Handle scoutId query parameter to create or navigate to conversation
  useEffect(() => {
    const scoutId = searchParams.get('scoutId');
    if (scoutId && !loading && processingScoutId !== scoutId) {
      handleScoutIdParam(scoutId);
    }
  }, [searchParams, loading, processingScoutId, handleScoutIdParam]);

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

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { label: 'Pending Approval', class: 'warning' },
      'active': { label: 'Active', class: 'success' },
      'ignored_by_scout': { label: 'Ignored', class: 'muted' },
      'ignored_by_player': { label: 'Ignored', class: 'muted' },
      'blocked_by_scout': { label: 'Blocked', class: 'danger' },
      'blocked_by_player': { label: 'Blocked', class: 'danger' },
      'closed': { label: 'Closed', class: 'secondary' }
    };
    return badges[status] || { label: status, class: 'secondary' };
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'active') return conv.status === 'active';
    if (filter === 'pending') return conv.status === 'pending';
    if (filter === 'closed') return conv.status === 'closed';
    return true;
  });

  return (
    <div className="messages-wrapper">
      <div className="messages-container">
        <div className="messages-header">
          <div>
            <h1>Messages</h1>
            <p>Recruitment-focused conversations</p>
          </div>
        </div>

          {/* Filters */}
          <div className="messages-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
              onClick={() => setFilter('closed')}
            >
              Closed
            </button>
          </div>

          {/* Conversations List */}
          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <span className="material-icons">message</span>
                </div>
                <h3>No conversations yet</h3>
                <p>Conversations will appear here once you start chatting with {user.role === 'scout' ? 'players' : 'scouts'}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const statusBadge = getStatusBadge(conv.status);
                return (
                  <div
                    key={conv.id}
                    className="conversation-card"
                    onClick={() => navigate(`/messages/${conv.id}`)}
                  >
                    <div className="conv-avatar">
                      {conv.other_user_picture ? (
                        <img src={conv.other_user_picture} alt={conv.other_user_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {conv.other_user_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="conv-content">
                      <div className="conv-header">
                        <h3>{conv.other_user_name}</h3>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      
                      <div className="conv-purpose">
                        <span className="material-icons">work</span> {getPurposeLabel(conv.purpose)}
                      </div>
                      
                      {conv.last_message && (
                        <div className="conv-last-message">
                          {conv.last_message}
                        </div>
                      )}
                      
                      <div className="conv-meta">
                        {conv.last_message_time && (
                          <span className="conv-time">
                            {new Date(conv.last_message_time).toLocaleDateString()}
                          </span>
                        )}
                        {conv.unread_count > 0 && (
                          <span className="unread-badge">{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
    </div>
  );
}
