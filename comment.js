// ===== COMMENTS SYSTEM - FIREBASE INTEGRATION =====

class CommentSystem {
    constructor(articleId, config) {
        this.articleId = articleId;
        this.currentUser = null;
        this.isAdmin = false;
        this.comments = [];
        this.sortBy = 'newest'; // newest, oldest, popular
        this.expandedReplies = new Set();
        this.editingCommentId = null;
        this.replyingToId = null;
        this.deleteTarget = null;
        this.container = null;
        this.config = config;
        
        this.initFirebase();
        this.initAuth();
    }

    initFirebase() {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
        }
        this.db = firebase.database();
        this.auth = firebase.auth();
    }

    initAuth() {
        this.auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                // Check if user is admin
                const adminRef = this.db.ref(`admins/${user.uid}`);
                const snapshot = await adminRef.once('value');
                this.isAdmin = snapshot.exists();
            } else {
                this.isAdmin = false;
            }
            this.render();
            this.loadComments();
        });
    }

    mount(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        this.loadComments();
    }

    render() {
        if (!this.container) return;
        
        const isAuthenticated = !!this.currentUser;
        const userData = this.currentUser ? {
            name: this.currentUser.displayName || 'User',
            email: this.currentUser.email,
            photoURL: this.currentUser.photoURL
        } : null;

        this.container.innerHTML = `
            <section class="comments-section">
                <div class="comments-header">
                    <h2 class="comments-title">
                        <span class="material-icons-round">forum</span>
                        Comments
                        <span class="comments-count" id="commentsCount">0</span>
                    </h2>
                    
                    <div class="comments-sort">
                        <button class="sort-btn ${this.sortBy === 'newest' ? 'active' : ''}" data-sort="newest">
                            <span class="material-icons-round">new_releases</span>
                            Newest
                        </button>
                        <button class="sort-btn ${this.sortBy === 'oldest' ? 'active' : ''}" data-sort="oldest">
                            <span class="material-icons-round">history</span>
                            Oldest
                        </button>
                        <button class="sort-btn ${this.sortBy === 'popular' ? 'active' : ''}" data-sort="popular">
                            <span class="material-icons-round">trending_up</span>
                            Most Liked
                        </button>
                    </div>
                </div>

                <div class="comment-form-container">
                    ${isAuthenticated ? `
                        <div class="comment-form-header">
                            <img src="${userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1a73e8&color=fff`}" 
                                 alt="${userData.name}" 
                                 class="comment-form-avatar"
                                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1a73e8&color=fff'">
                            <span class="comment-form-title">Comment as ${userData.name}</span>
                        </div>
                        <div class="comment-form">
                            <div class="comment-input-wrapper">
                                <textarea 
                                    class="comment-input" 
                                    id="commentInput" 
                                    placeholder="Share your thoughts... (max 2000 characters)"
                                    maxlength="2000"
                                ></textarea>
                                <span class="comment-char-count" id="commentCharCount">0/2000</span>
                            </div>
                            <div class="comment-form-actions">
                                <button class="submit-btn" id="submitComment">
                                    <span class="material-icons-round">send</span>
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    ` : `
                        <div class="comment-form-login">
                            <p>Only Reverbit account holders can comment. Sign in to join the discussion!</p>
                            <button class="login-btn" id="loginBtn">
                                <span class="material-icons-round">login</span>
                                Sign in with Reverbit
                            </button>
                        </div>
                    `}
                </div>

                <div class="comments-list" id="commentsList">
                    <div class="comments-loading">
                        <div class="spinner"></div>
                        <p>Loading comments...</p>
                    </div>
                </div>
            </section>

            <!-- Delete Confirmation Modal -->
            <div class="delete-modal" id="deleteModal">
                <div class="delete-modal-content">
                    <div class="delete-modal-icon">
                        <span class="material-icons-round">delete_forever</span>
                    </div>
                    <h3 class="delete-modal-title">Delete Comment?</h3>
                    <p class="delete-modal-text">This action cannot be undone. The comment will be permanently removed.</p>
                    <div class="delete-modal-actions">
                        <button class="delete-modal-btn cancel" id="cancelDelete">Cancel</button>
                        <button class="delete-modal-btn delete" id="confirmDelete">Delete</button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sortBy = e.target.closest('.sort-btn').dataset.sort;
                this.render();
                this.displayComments();
            });
        });

        // Comment input
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
            commentInput.addEventListener('input', (e) => {
                const count = e.target.value.length;
                const countSpan = document.getElementById('commentCharCount');
                countSpan.textContent = `${count}/2000`;
                countSpan.classList.toggle('warning', count > 1800);
                countSpan.classList.toggle('error', count === 2000);
            });
        }

        // Submit comment
        const submitBtn = document.getElementById('submitComment');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitComment());
        }

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.signIn());
        }

        // Delete modal
        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        }

        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDelete());
        }
    }

    async loadComments() {
        const commentsRef = this.db.ref(`comments`);
        
        commentsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                this.comments = [];
                this.displayComments();
                return;
            }

            // Convert object to array and filter by articleId
            this.comments = Object.entries(data)
                .map(([id, comment]) => ({
                    id,
                    ...comment
                }))
                .filter(comment => comment.articleId === this.articleId);

            this.displayComments();
        });
    }

    displayComments() {
        const commentsList = document.getElementById('commentsList');
        const commentsCount = document.getElementById('commentsCount');
        
        if (!commentsList) return;

        // Update count
        if (commentsCount) {
            commentsCount.textContent = this.comments.length;
        }

        if (this.comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <span class="material-icons-round">chat_bubble_outline</span>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }

        // Sort comments
        const sortedComments = this.sortComments(this.comments);
        
        // Separate pinned comments
        const pinnedComments = sortedComments.filter(c => c.isPinned);
        const regularComments = sortedComments.filter(c => !c.isPinned);

        let html = '';

        // Display pinned comments first
        pinnedComments.forEach(comment => {
            html += this.renderComment(comment, true);
        });

        // Display regular comments
        regularComments.forEach(comment => {
            html += this.renderComment(comment, false);
        });

        commentsList.innerHTML = html;
        this.attachCommentEventListeners();
    }

    sortComments(comments) {
        switch(this.sortBy) {
            case 'newest':
                return comments.sort((a, b) => b.timestamp - a.timestamp);
            case 'oldest':
                return comments.sort((a, b) => a.timestamp - b.timestamp);
            case 'popular':
                return comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            default:
                return comments;
        }
    }

    renderComment(comment, isPinned) {
        const timeAgo = this.getTimeAgo(comment.timestamp);
        const canEdit = this.currentUser && (this.currentUser.uid === comment.userId || this.isAdmin);
        const canDelete = this.currentUser && (this.currentUser.uid === comment.userId || this.isAdmin);
        const canPin = this.isAdmin;
        const canHeart = this.isAdmin;
        const isLiked = this.currentUser && comment.likedBy && comment.likedBy[this.currentUser.uid];
        
        const replies = comment.replies ? Object.values(comment.replies) : [];
        const repliesCount = replies.length;

        return `
            <div class="comment-item ${isPinned ? 'pinned' : ''} ${comment.isCreatorHearted ? 'creator-hearted' : ''}" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-user">
                        <img src="${comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=1a73e8&color=fff`}" 
                             alt="${comment.userName}" 
                             class="comment-user-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=1a73e8&color=fff'">
                        <div class="comment-user-info">
                            <span class="comment-user-name">
                                ${comment.userName}
                                ${comment.userId === this.articleAuthorId ? '<span class="user-badge creator" title="Article Creator">👑</span>' : ''}
                                ${this.isAdmin ? '<span class="user-badge admin" title="Admin">⚡</span>' : ''}
                            </span>
                            <span class="comment-time">
                                <span class="material-icons-round">schedule</span>
                                ${timeAgo}
                                ${comment.edited ? '<span class="badge edited">edited</span>' : ''}
                            </span>
                        </div>
                    </div>
                    
                    <div class="comment-badges">
                        ${comment.isPinned ? '<span class="badge pinned"><span class="material-icons-round">push_pin</span> Pinned</span>' : ''}
                        ${comment.isCreatorHearted ? '<span class="badge creator-heart"><span class="material-icons-round">favorite</span> Creator loved</span>' : ''}
                    </div>
                </div>

                <div class="comment-content">
                    ${this.editingCommentId === comment.id ? `
                        <textarea class="comment-text editing" id="editInput-${comment.id}">${comment.text}</textarea>
                        <div class="comment-edit-actions">
                            <button class="cancel-btn" onclick="commentSystem.cancelEdit()">Cancel</button>
                            <button class="submit-btn" onclick="commentSystem.saveEdit('${comment.id}')">Save</button>
                        </div>
                    ` : `
                        <div class="comment-text">${this.formatCommentText(comment.text)}</div>
                    `}
                </div>

                <div class="comment-footer">
                    <div class="comment-actions">
                        <button class="comment-action-btn ${isLiked ? 'liked' : ''}" onclick="commentSystem.toggleLike('${comment.id}')">
                            <span class="material-icons-round">${isLiked ? 'favorite' : 'favorite_border'}</span>
                            ${comment.likes || 0}
                        </button>
                        
                        <button class="comment-action-btn" onclick="commentSystem.startReply('${comment.id}')">
                            <span class="material-icons-round">reply</span>
                            Reply
                        </button>
                        
                        ${canEdit ? `
                            <button class="comment-action-btn" onclick="commentSystem.startEdit('${comment.id}')">
                                <span class="material-icons-round">edit</span>
                                Edit
                            </button>
                        ` : ''}
                        
                        ${canDelete ? `
                            <button class="comment-action-btn" onclick="commentSystem.openDeleteModal('${comment.id}')">
                                <span class="material-icons-round">delete</span>
                                Delete
                            </button>
                        ` : ''}
                        
                        ${canPin ? `
                            <button class="comment-action-btn" onclick="commentSystem.togglePin('${comment.id}')">
                                <span class="material-icons-round">${comment.isPinned ? 'push_pin' : 'push_pin'}</span>
                                ${comment.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                        ` : ''}
                        
                        ${canHeart ? `
                            <button class="comment-action-btn" onclick="commentSystem.toggleCreatorHeart('${comment.id}')">
                                <span class="material-icons-round">${comment.isCreatorHearted ? 'favorite' : 'favorite_border'}</span>
                                ${comment.isCreatorHearted ? 'Unheart' : 'Heart'}
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="comment-stats">
                        ${repliesCount > 0 ? `
                            <span class="stat-item">
                                <span class="material-icons-round">chat</span>
                                ${repliesCount} ${repliesCount === 1 ? 'reply' : 'replies'}
                            </span>
                        ` : ''}
                    </div>
                </div>

                <!-- Replies Section -->
                ${replies.length > 0 ? this.renderReplies(comment.id, replies) : ''}
                
                <!-- Reply Form -->
                ${this.replyingToId === comment.id ? this.renderReplyForm(comment.id) : ''}
            </div>
        `;
    }

    renderReplies(commentId, replies) {
        const isExpanded = this.expandedReplies.has(commentId);
        
        return `
            <div class="replies-section">
                <button class="replies-toggle" onclick="commentSystem.toggleReplies('${commentId}')">
                    <span class="material-icons-round">${isExpanded ? 'expand_less' : 'expand_more'}</span>
                    ${isExpanded ? 'Hide' : 'Show'} replies (${replies.length})
                </button>
                
                ${isExpanded ? `
                    <div class="replies-list">
                        ${replies.map(reply => this.renderReply(commentId, reply)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderReply(commentId, reply) {
        const timeAgo = this.getTimeAgo(reply.timestamp);
        const canDelete = this.currentUser && (this.currentUser.uid === reply.userId || this.isAdmin);
        const isLiked = this.currentUser && reply.likedBy && reply.likedBy[this.currentUser.uid];

        return `
            <div class="reply-item" data-reply-id="${reply.id}">
                <div class="reply-header">
                    <div class="reply-user">
                        <img src="${reply.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName)}&background=1a73e8&color=fff`}" 
                             alt="${reply.userName}" 
                             class="reply-user-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName)}&background=1a73e8&color=fff'">
                        <span class="reply-user-name">${reply.userName}</span>
                    </div>
                    <span class="reply-time">
                        <span class="material-icons-round">schedule</span>
                        ${timeAgo}
                    </span>
                </div>
                
                <div class="reply-content">
                    <div class="reply-text">${this.formatCommentText(reply.text)}</div>
                </div>
                
                <div class="reply-actions">
                    <button class="reply-action-btn ${isLiked ? 'liked' : ''}" onclick="commentSystem.toggleReplyLike('${commentId}', '${reply.id}')">
                        <span class="material-icons-round">${isLiked ? 'favorite' : 'favorite_border'}</span>
                        ${reply.likes || 0}
                    </button>
                    
                    ${canDelete ? `
                        <button class="reply-action-btn" onclick="commentSystem.deleteReply('${commentId}', '${reply.id}')">
                            <span class="material-icons-round">delete</span>
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderReplyForm(commentId) {
        return `
            <div class="reply-form">
                <textarea class="reply-input" id="replyInput-${commentId}" placeholder="Write your reply..." maxlength="2000"></textarea>
                <div class="reply-form-actions">
                    <button class="cancel-btn" onclick="commentSystem.cancelReply()">Cancel</button>
                    <button class="submit-btn" onclick="commentSystem.submitReply('${commentId}')">
                        <span class="material-icons-round">send</span>
                        Post Reply
                    </button>
                </div>
            </div>
        `;
    }

    attachCommentEventListeners() {
        // Any additional dynamic event listeners can be attached here
    }

    // ===== COMMENT ACTIONS =====

    async submitComment() {
        if (!this.currentUser) return;
        
        const input = document.getElementById('commentInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showToast('Please enter a comment', 'error');
            return;
        }
        
        if (text.length > 2000) {
            this.showToast('Comment is too long (max 2000 characters)', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitComment');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const commentData = {
            articleId: this.articleId,
            userId: this.currentUser.uid,
            userName: this.currentUser.displayName || 'User',
            userAvatar: this.currentUser.photoURL || null,
            text: text,
            timestamp: Date.now(),
            likes: 0,
            likedBy: {},
            replies: 0,
            edited: false,
            isPinned: false,
            isCreatorHearted: false
        };

        try {
            const newCommentRef = this.db.ref('comments').push();
            await newCommentRef.set(commentData);
            
            input.value = '';
            document.getElementById('commentCharCount').textContent = '0/2000';
            this.showToast('Comment posted successfully!');
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showToast('Failed to post comment. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    async toggleLike(commentId) {
        if (!this.currentUser) {
            this.showToast('Please sign in to like comments', 'error');
            return;
        }

        const commentRef = this.db.ref(`comments/${commentId}`);
        
        try {
            const snapshot = await commentRef.once('value');
            const comment = snapshot.val();
            
            const likedBy = comment.likedBy || {};
            const isLiked = !!likedBy[this.currentUser.uid];
            
            if (isLiked) {
                // Unlike
                delete likedBy[this.currentUser.uid];
                await commentRef.update({
                    likes: (comment.likes || 1) - 1,
                    likedBy: likedBy
                });
            } else {
                // Like
                likedBy[this.currentUser.uid] = true;
                await commentRef.update({
                    likes: (comment.likes || 0) + 1,
                    likedBy: likedBy
                });
                
                // Add heart animation
                const btn = event.target.closest('.comment-action-btn');
                if (btn) btn.classList.add('heart-animation');
                setTimeout(() => {
                    if (btn) btn.classList.remove('heart-animation');
                }, 300);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            this.showToast('Failed to update like', 'error');
        }
    }

    async toggleReplyLike(commentId, replyId) {
        if (!this.currentUser) {
            this.showToast('Please sign in to like replies', 'error');
            return;
        }

        const replyRef = this.db.ref(`comments/${commentId}/replies/${replyId}`);
        
        try {
            const snapshot = await replyRef.once('value');
            const reply = snapshot.val();
            
            const likedBy = reply.likedBy || {};
            const isLiked = !!likedBy[this.currentUser.uid];
            
            if (isLiked) {
                delete likedBy[this.currentUser.uid];
                await replyRef.update({
                    likes: (reply.likes || 1) - 1,
                    likedBy: likedBy
                });
            } else {
                likedBy[this.currentUser.uid] = true;
                await replyRef.update({
                    likes: (reply.likes || 0) + 1,
                    likedBy: likedBy
                });
            }
        } catch (error) {
            console.error('Error toggling reply like:', error);
            this.showToast('Failed to update like', 'error');
        }
    }

    startEdit(commentId) {
        this.editingCommentId = commentId;
        this.replyingToId = null;
        this.render();
    }

    async saveEdit(commentId) {
        const input = document.getElementById(`editInput-${commentId}`);
        const newText = input.value.trim();
        
        if (!newText) {
            this.showToast('Comment cannot be empty', 'error');
            return;
        }
        
        if (newText.length > 2000) {
            this.showToast('Comment is too long (max 2000 characters)', 'error');
            return;
        }

        try {
            await this.db.ref(`comments/${commentId}`).update({
                text: newText,
                edited: true,
                editedTimestamp: Date.now()
            });
            
            this.editingCommentId = null;
            this.showToast('Comment updated successfully!');
        } catch (error) {
            console.error('Error editing comment:', error);
            this.showToast('Failed to edit comment', 'error');
        }
    }

    cancelEdit() {
        this.editingCommentId = null;
        this.render();
    }

    startReply(commentId) {
        if (!this.currentUser) {
            this.showToast('Please sign in to reply', 'error');
            return;
        }
        
        this.replyingToId = commentId;
        this.editingCommentId = null;
        this.render();
    }

    async submitReply(commentId) {
        const input = document.getElementById(`replyInput-${commentId}`);
        const text = input.value.trim();
        
        if (!text) {
            this.showToast('Please enter a reply', 'error');
            return;
        }
        
        if (text.length > 2000) {
            this.showToast('Reply is too long (max 2000 characters)', 'error');
            return;
        }

        const replyData = {
            id: Date.now().toString(),
            userId: this.currentUser.uid,
            userName: this.currentUser.displayName || 'User',
            userAvatar: this.currentUser.photoURL || null,
            text: text,
            timestamp: Date.now(),
            likes: 0,
            likedBy: {}
        };

        try {
            const commentRef = this.db.ref(`comments/${commentId}`);
            const snapshot = await commentRef.once('value');
            const comment = snapshot.val();
            
            const replies = comment.replies || {};
            replies[replyData.id] = replyData;
            
            await commentRef.update({
                replies: replies,
                repliesCount: Object.keys(replies).length
            });
            
            this.replyingToId = null;
            this.expandedReplies.add(commentId);
            this.showToast('Reply posted successfully!');
        } catch (error) {
            console.error('Error posting reply:', error);
            this.showToast('Failed to post reply', 'error');
        }
    }

    cancelReply() {
        this.replyingToId = null;
        this.render();
    }

    toggleReplies(commentId) {
        if (this.expandedReplies.has(commentId)) {
            this.expandedReplies.delete(commentId);
        } else {
            this.expandedReplies.add(commentId);
        }
        this.render();
    }

    async deleteReply(commentId, replyId) {
        if (!confirm('Delete this reply?')) return;
        
        try {
            const commentRef = this.db.ref(`comments/${commentId}`);
            const snapshot = await commentRef.once('value');
            const comment = snapshot.val();
            
            const replies = comment.replies || {};
            delete replies[replyId];
            
            await commentRef.update({
                replies: replies,
                repliesCount: Object.keys(replies).length
            });
            
            this.showToast('Reply deleted successfully!');
        } catch (error) {
            console.error('Error deleting reply:', error);
            this.showToast('Failed to delete reply', 'error');
        }
    }

    openDeleteModal(commentId) {
        this.deleteTarget = commentId;
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.add('active');
    }

    closeDeleteModal() {
        this.deleteTarget = null;
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.remove('active');
    }

    async confirmDelete() {
        if (!this.deleteTarget) return;
        
        try {
            await this.db.ref(`comments/${this.deleteTarget}`).remove();
            this.closeDeleteModal();
            this.showToast('Comment deleted successfully!');
        } catch (error) {
            console.error('Error deleting comment:', error);
            this.showToast('Failed to delete comment', 'error');
        }
    }

    async togglePin(commentId) {
        if (!this.isAdmin) return;
        
        try {
            const commentRef = this.db.ref(`comments/${commentId}`);
            const snapshot = await commentRef.once('value');
            const comment = snapshot.val();
            
            await commentRef.update({
                isPinned: !comment.isPinned
            });
            
            this.showToast(comment.isPinned ? 'Comment unpinned' : 'Comment pinned');
        } catch (error) {
            console.error('Error toggling pin:', error);
            this.showToast('Failed to update pin status', 'error');
        }
    }

    async toggleCreatorHeart(commentId) {
        if (!this.isAdmin) return;
        
        try {
            const commentRef = this.db.ref(`comments/${commentId}`);
            const snapshot = await commentRef.once('value');
            const comment = snapshot.val();
            
            await commentRef.update({
                isCreatorHearted: !comment.isCreatorHearted
            });
            
            this.showToast(comment.isCreatorHearted ? 'Heart removed' : 'Comment hearted!');
        } catch (error) {
            console.error('Error toggling creator heart:', error);
            this.showToast('Failed to update heart status', 'error');
        }
    }

    // ===== UTILITY FUNCTIONS =====

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return interval === 1 ? `a ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }
        
        return 'just now';
    }

    formatCommentText(text) {
        // Basic URL detection and linking
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast show ${type}`;
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    signIn() {
        // Use your existing auth system
        if (window.ReverbitAuth) {
            window.ReverbitAuth.signIn();
        } else {
            window.location.href = 'https://aditya-cmd-max.github.io/signin';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Make commentSystem globally accessible for onclick handlers
    window.commentSystem = new CommentSystem('best-smartphones-under-20000-india-2026', {
        apiKey: "AIzaSyDE0eix0uVHuUS5P5DbuPA-SZt6pD8ob8A",
        authDomain: "reverbit11.firebaseapp.com",
        databaseURL: "https://reverbit11-default-rtdb.firebaseio.com",
        projectId: "reverbit11",
        storageBucket: "reverbit11.firebasestorage.app",
        messagingSenderId: "607495314412",
        appId: "1:607495314412:web:8c098f88b0d3b4620f7ec9",
        measurementId: "G-DMWMRM1M47"
    });
    

    setTimeout(() => {
        window.commentSystem.mount('comments-container');
    }, 100);
});
