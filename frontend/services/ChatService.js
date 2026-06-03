// // services/ChatService.js
// import { API_BASE_URL } from "../config/config_ip";

// class ChatService {
//   // Get all conversations for current user
//   async getConversations(phoneNumber) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
//         method: 'GET',
//         headers: {
//           'X-Phone-Number': phoneNumber,
//           'Content-Type': 'application/json',
//         },
//       });
//       return await response.json();
//     } catch (error) {
//       console.error('Get conversations error:', error);
//       return { success: false, conversations: [] };
//     }
//   }

//   // Get messages for a specific conversation
//   async getMessages(conversationId, phoneNumber, limit = 50, offset = 0) {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
//         {
//           method: 'GET',
//           headers: {
//             'X-Phone-Number': phoneNumber,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return await response.json();
//     } catch (error) {
//       console.error('Get messages error:', error);
//       return { success: false, messages: [] };
//     }
//   }

//   // Send a message
//   async sendMessage(conversationId, phoneNumber, text, type = 'text', fileUrl = null) {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
//         {
//           method: 'POST',
//           headers: {
//             'X-Phone-Number': phoneNumber,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ text, type, file_url: fileUrl }),
//         }
//       );
//       return await response.json();
//     } catch (error) {
//       console.error('Send message error:', error);
//       return { success: false };
//     }
//   }

//   // Mark messages as read/seen
//   async markMessagesAsRead(conversationId, phoneNumber, messageIds) {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/read`,
//         {
//           method: 'POST',
//           headers: {
//             'X-Phone-Number': phoneNumber,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ message_ids: messageIds }),
//         }
//       );
//       return await response.json();
//     } catch (error) {
//       console.error('Mark as read error:', error);
//       return { success: false };
//     }
//   }

//   // Clear all messages in a conversation
//   async clearChat(conversationId, phoneNumber) {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/chat/conversations/${conversationId}/clear`,
//         {
//           method: 'POST',
//           headers: {
//             'X-Phone-Number': phoneNumber,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return await response.json();
//     } catch (error) {
//       console.error('Clear chat error:', error);
//       return { success: false };
//     }
//   }

//   // Delete a single message
//   async deleteMessage(messageId, phoneNumber) {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/chat/messages/${messageId}`,
//         {
//           method: 'DELETE',
//           headers: {
//             'X-Phone-Number': phoneNumber,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return await response.json();
//     } catch (error) {
//       console.error('Delete message error:', error);
//       return { success: false };
//     }
//   }

//   // Report a user
//   async reportUser(phoneNumber, reportedUserPhone, conversationId, reason = '') {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/chat/report-user`, {
//         method: 'POST',
//         headers: {
//           'X-Phone-Number': phoneNumber,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           reported_user_phone: reportedUserPhone,
//           conversation_id: conversationId,
//           reason: reason,
//         }),
//       });
//       return await response.json();
//     } catch (error) {
//       console.error('Report user error:', error);
//       return { success: false };
//     }
//   }

//   // Report a message
//   async reportMessage(phoneNumber, messageId, conversationId, reason = '') {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/chat/report-message`, {
//         method: 'POST',
//         headers: {
//           'X-Phone-Number': phoneNumber,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message_id: messageId,
//           conversation_id: conversationId,
//           reason: reason,
//         }),
//       });
//       return await response.json();
//     } catch (error) {
//       console.error('Report message error:', error);
//       return { success: false };
//     }
//   }

//   // Get unread count
//   async getUnreadCount(phoneNumber) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/chat/unread-count`, {
//         method: 'GET',
//         headers: {
//           'X-Phone-Number': phoneNumber,
//           'Content-Type': 'application/json',
//         },
//       });
//       return await response.json();
//     } catch (error) {
//       console.error('Get unread count error:', error);
//       return { success: false, unread_count: 0 };
//     }
//   }
//  // In ChatService.js

// // Block a user
// // In ChatService.js

// // In ChatService.js - Fix the isBlocked method

// async isBlocked(phoneNumber, otherPhone) {
//   try {
//     // Don't encode the entire phone number, just the + sign
//     const encodedPhone = encodeURIComponent(otherPhone);
//     console.log('Checking blocked - encoded:', encodedPhone);
//     console.log('Checking blocked - original:', otherPhone);
    
//     const url = `${API_BASE_URL}/api/chat/is-blocked/${encodedPhone}`;
//     console.log('Full URL:', url);
    
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'X-Phone-Number': phoneNumber,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',  // Add this
//       },
//     });
    
//     console.log('Response status:', response.status);
//     console.log('Response headers:', response.headers);
    
//     // Check if response is OK
//     if (!response.ok) {
//       const text = await response.text();
//       console.error('Error response body:', text);
//       throw new Error(`HTTP ${response.status}: ${text}`);
//     }
    
//     const result = await response.json();
//     console.log('Is blocked response:', result);
    
//     return result;
//   } catch (error) {
//     console.error('Check blocked error:', error);
//     return { success: false, is_blocked: false };
//   }
// }
// // In ChatService.js

// async blockUser(phoneNumber, blockedPhone) {
//   try {
//     console.log('=== BLOCK USER API CALL ===');
//     console.log('Raw caller phone:', phoneNumber);
//     console.log('Raw target phone:', blockedPhone);
    
//     // Clean the phone numbers (remove any extra characters)
//     const cleanBlocker = phoneNumber.replace(/[^0-9+]/g, '');
//     const cleanBlocked = blockedPhone.replace(/[^0-9+]/g, '');
    
//     console.log('Clean blocker:', cleanBlocker);
//     console.log('Clean blocked:', cleanBlocked);
    
//     // Validate phones are different
//     if (cleanBlocker === cleanBlocked) {
//       console.error('ERROR: Cannot block yourself!');
//       return { success: false, message: 'Cannot block yourself' };
//     }
    
//     const requestBody = { blocked_phone: cleanBlocked };
//     console.log('Request body:', requestBody);
//     console.log('X-Phone-Number header:', cleanBlocker);
    
//     const response = await fetch(`${API_BASE_URL}/api/chat/block-user`, {
//       method: 'POST',
//       headers: {
//         'X-Phone-Number': cleanBlocker,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify(requestBody),
//     });
    
//     console.log('Response status:', response.status);
    
//     // Check if response is OK
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Error response:', errorText);
//       throw new Error(`HTTP ${response.status}: ${errorText}`);
//     }
    
//     const result = await response.json();
//     console.log('Block API result:', result);
//     console.log('=========================');
    
//     return result;
//   } catch (error) {
//     console.error('Block user error:', error);
//     return { success: false, message: error.message };
//   }
// }
// async unblockUser(phoneNumber, blockedPhone) {
//   try {

//     const cleanBlocker = phoneNumber.replace(/[^0-9+]/g, '');
//     const cleanBlocked = blockedPhone.replace(/[^0-9+]/g, '');

//     console.log('=== UNBLOCK USER ===');
//     console.log('Blocker:', cleanBlocker);
//     console.log('Blocked:', cleanBlocked);

//     const response = await fetch(
//       `${API_BASE_URL}/api/chat/unblock-user`,
//       {
//         method: 'POST',
//         headers: {
//           'X-Phone-Number': cleanBlocker,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         body: JSON.stringify({
//           blocked_phone: cleanBlocked,
//         }),
//       }
//     );

//     console.log('UNBLOCK STATUS:', response.status);

//     const result = await response.json();

//     console.log('UNBLOCK RESPONSE:', result);

//     return result;

//   } catch (error) {
//     console.error('UNBLOCK ERROR:', error);

//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// }
// async deleteConversation(conversationId, phoneNumber) {
//   try {
//     console.log('Deleting conversation %s for user %s', conversationId, phoneNumber);
//     const response = await fetch(
//       `${API_BASE_URL}/api/chat/conversations/${conversationId}`,
//       {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Phone-Number': phoneNumber,
//         },
//       }
//     );

//     return await response.json();

//   } catch (error) {

//     console.error(
//       'Delete conversation error:',
//       error
//     );

//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// }
// async hideChat(conversationId, phoneNumber) {
//   try {

//     const response = await fetch(
//       `${API_BASE_URL}/api/chat/conversations/${conversationId}/hide`,
//       {
//         method: 'POST',
//         headers: {
//           'X-Phone-Number': phoneNumber,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     return await response.json();

//   } catch (error) {

//     console.error(
//       'Hide chat error:',
//       error
//     );

//     return {
//       success: false,
//     };
//   }
// }
// // Check if a user is blocked
// async isBlocked(phoneNumber, otherPhone) {
//   try {
//     // Don't encode the entire phone number, just the + sign
//     const encodedPhone = encodeURIComponent(otherPhone);
//     console.log('Checking blocked - encoded:', encodedPhone);
//     console.log('Checking blocked - original:', otherPhone);
    
//     const url = `${API_BASE_URL}/api/chat/is-blocked/${encodedPhone}`;
//     console.log('Full URL:', url);
    
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'X-Phone-Number': phoneNumber,
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//     });
    
//     console.log('Response status:', response.status);
//     console.log('Response headers:', response.headers);
    
//     if (!response.ok) {
//       const text = await response.text();
//       console.error('Error response body:', text);
//       throw new Error(`HTTP ${response.status}: ${text}`);
//     }
    
//     const result = await response.json();
//     console.log('Is blocked response:', result);
    
//     return result;
//   } catch (error) {
//     console.error('Check blocked error:', error);
//     return { success: false, is_blocked: false };
//   }
// }

//   // Get blocked users list
//   async getBlockedUsers(phoneNumber) {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/chat/blocked-users`, {
//         method: 'GET',
//         headers: {
//           'X-Phone-Number': phoneNumber,
//           'Content-Type': 'application/json',
//         },
//       });
//       return await response.json();
//     } catch (error) {
//       console.error('Get blocked users error:', error);
//       return { success: false, blocked_users: [] };
//     }
//   }

 
// }

// export default new ChatService();
// services/ChatService.js
import { API_BASE_URL } from "../config/config_ip";

class ChatService {
  // Get all conversations for current user - SORTED by latest message
  async getConversations(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'GET',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Sort conversations by last_message_time (newest first) on client side
      if (data.success && data.conversations && Array.isArray(data.conversations)) {
        // Sort in descending order (most recent first)
        const sortedConversations = [...data.conversations].sort((a, b) => {
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          return timeB - timeA; // Descending - newest first
        });
        
        console.log('Sorted conversations by latest message:', sortedConversations.map(c => ({
          id: c.id,
          name: c.other_user?.name,
          last_message_time: c.last_message_time
        })));
        
        return {
          ...data,
          conversations: sortedConversations
        };
      }
      
      return data;
    } catch (error) {
      console.error('Get conversations error:', error);
      return { success: false, conversations: [] };
    }
  }

  // Get a single conversation by ID
  async getConversation(conversationId, phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get conversation error:', error);
      return { success: false, conversation: null };
    }
  }

  // Get messages for a specific conversation
  async getMessages(conversationId, phoneNumber, limit = 50, offset = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'X-Phone-Number': phoneNumber,
            'Content-Type': 'application/json',
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Get messages error:', error);
      return { success: false, messages: [] };
    }
  }

  // Create or get an existing conversation
  async getOrCreateConversation(phoneNumber, participantPhone, rideId = null) {
    try {
      const requestBody = { 
        participant_phone: participantPhone 
      };
      
      // Add ride_id if provided
      if (rideId) {
        requestBody.ride_id = rideId;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          conversationId: data.conversation.id,
          conversation: data.conversation
        };
      }
      
      return { success: false, conversationId: null };
    } catch (error) {
      console.error('Get or create conversation error:', error);
      return { success: false, conversationId: null };
    }
  }

  // Send a message
  async sendMessage(conversationId, phoneNumber, text, type = 'text', fileUrl = null) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'X-Phone-Number': phoneNumber,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, type, file_url: fileUrl }),
        }
      );
      const result = await response.json();
      
      // After sending message successfully, update the conversation's last_message_time
      // This ensures the conversation moves to the top on next fetch
      if (result.success) {
        console.log('Message sent successfully, conversation will be updated');
      }
      
      return result;
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false };
    }
  }

  // Mark messages as read/seen
  async markMessagesAsRead(conversationId, phoneNumber, messageIds) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages/read`,
        {
          method: 'POST',
          headers: {
            'X-Phone-Number': phoneNumber,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message_ids: messageIds }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false };
    }
  }

  // Clear all messages in a conversation
  async clearChat(conversationId, phoneNumber) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/clear`,
        {
          method: 'POST',
          headers: {
            'X-Phone-Number': phoneNumber,
            'Content-Type': 'application/json',
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Clear chat error:', error);
      return { success: false };
    }
  }

  // Delete a single message
  async deleteMessage(messageId, phoneNumber) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Phone-Number': phoneNumber,
            'Content-Type': 'application/json',
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Delete message error:', error);
      return { success: false };
    }
  }

  // Report a user
  async reportUser(phoneNumber, reportedUserPhone, conversationId, reason = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/report-user`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reported_user_phone: reportedUserPhone,
          conversation_id: conversationId,
          reason: reason,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Report user error:', error);
      return { success: false };
    }
  }

  // Report a message
  async reportMessage(phoneNumber, messageId, conversationId, reason = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/report-message`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message_id: messageId,
          conversation_id: conversationId,
          reason: reason,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Report message error:', error);
      return { success: false };
    }
  }

  // Get unread count
  async getUnreadCount(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/unread-count`, {
        method: 'GET',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get unread count error:', error);
      return { success: false, unread_count: 0 };
    }
  }

  // Block a user
  async blockUser(phoneNumber, blockedPhone) {
    try {
      console.log('=== BLOCK USER API CALL ===');
      console.log('Raw caller phone:', phoneNumber);
      console.log('Raw target phone:', blockedPhone);
      
      const cleanBlocker = phoneNumber.replace(/[^0-9+]/g, '');
      const cleanBlocked = blockedPhone.replace(/[^0-9+]/g, '');
      
      console.log('Clean blocker:', cleanBlocker);
      console.log('Clean blocked:', cleanBlocked);
      
      if (cleanBlocker === cleanBlocked) {
        console.error('ERROR: Cannot block yourself!');
        return { success: false, message: 'Cannot block yourself' };
      }
      
      const requestBody = { blocked_phone: cleanBlocked };
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/api/chat/block-user`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': cleanBlocker,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Block API result:', result);
      
      return result;
    } catch (error) {
      console.error('Block user error:', error);
      return { success: false, message: error.message };
    }
  }

  // Unblock a user
  async unblockUser(phoneNumber, blockedPhone) {
    try {
      const cleanBlocker = phoneNumber.replace(/[^0-9+]/g, '');
      const cleanBlocked = blockedPhone.replace(/[^0-9+]/g, '');

      console.log('=== UNBLOCK USER ===');
      console.log('Blocker:', cleanBlocker);
      console.log('Blocked:', cleanBlocked);

      const response = await fetch(`${API_BASE_URL}/api/chat/unblock-user`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': cleanBlocker,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ blocked_phone: cleanBlocked }),
      });

      console.log('UNBLOCK STATUS:', response.status);
      const result = await response.json();
      console.log('UNBLOCK RESPONSE:', result);

      return result;
    } catch (error) {
      console.error('UNBLOCK ERROR:', error);
      return { success: false, message: error.message };
    }
  }

  // Check if a user is blocked
  async isBlocked(phoneNumber, otherPhone) {
    try {
      const encodedPhone = encodeURIComponent(otherPhone);
      console.log('Checking blocked - encoded:', encodedPhone);
      
      const url = `${API_BASE_URL}/api/chat/is-blocked/${encodedPhone}`;
      console.log('Full URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response body:', text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      
      const result = await response.json();
      console.log('Is blocked response:', result);
      
      return result;
    } catch (error) {
      console.error('Check blocked error:', error);
      return { success: false, is_blocked: false };
    }
  }

  // Get blocked users list
  async getBlockedUsers(phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/blocked-users`, {
        method: 'GET',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Get blocked users error:', error);
      return { success: false, blocked_users: [] };
    }
  }

  // Delete conversation
  async deleteConversation(conversationId, phoneNumber) {
    try {
      console.log('Deleting conversation %s for user %s', conversationId, phoneNumber);
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Phone-Number': phoneNumber,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Delete conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Hide chat
  async hideChat(conversationId, phoneNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${conversationId}/hide`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': phoneNumber,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Hide chat error:', error);
      return { success: false };
    }
  }
}

export default new ChatService();