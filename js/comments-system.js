<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>Comments System — Reverbit Marina</title>
    <!-- Same design system as your article (no theme conflict) -->
    <style>
        /* ===== COMMENT SECTION STYLES (matches your existing theme) ===== */
        .comments-section {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--md-outline);
        }
        .comments-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
        }
        .comments-title {
            font-family: var(--font-heading);
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--md-on-surface);
        }
        .comment-sort {
            display: flex;
            gap: 8px;
            background: var(--md-surface-variant);
            padding: 4px 12px;
            border-radius: 40px;
            align-items: center;
        }
        .comment-sort select {
            background: transparent;
            border: none;
            font-family: var(--font-body);
            font-size: 0.85rem;
            color: var(--md-on-surface);
            cursor: pointer;
            outline: none;
        }
        .comment-login-prompt {
            background: var(--md-surface-variant);
            border-radius: var(--md-radius-large);
            padding: 1.5rem;
            text-align: center;
            margin-bottom: 2rem;
            border: 1px solid var(--md-outline);
        }
        .comment-login-btn {
            background: var(--md-primary);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
        }
        .comment-form-container {
            background: var(--md-surface);
            border-radius: var(--md-radius-large);
            margin-bottom: 2rem;
            border: 1px solid var(--md-outline);
            overflow: hidden;
        }
        .comment-form-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 1rem 1.5rem;
            background: var(--md-surface-variant);
            border-bottom: 1px solid var(--md-outline);
        }
        .comment-avatar-sm {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--md-primary);
        }
        .comment-form-body {
            padding: 1.5rem;
        }
        .comment-textarea {
            width: 100%;
            border: 1px solid var(--md-outline);
            border-radius: var(--md-radius-medium);
            padding: 12px 16px;
            font-family: var(--font-body);
            font-size: 0.95rem;
            background: var(--md-surface);
            color: var(--md-on-surface);
            resize: vertical;
            margin-bottom: 1rem;
        }
        .comment-textarea:focus {
            outline: none;
            border-color: var(--md-primary);
            box-shadow: 0 0 0 2px rgba(26,115,232,0.2);
        }
        .comment-form-actions {
            display: flex;
            justify-content: flex-end;
        }
        .btn-submit {
            background: var(--md-primary);
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 40px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        /* comment threads */
        .comment-thread {
            margin-bottom: 1.5rem;
        }
        .comment-card {
            background: var(--md-surface);
            border-radius: var(--md-radius-large);
            border: 1px solid var(--md-outline);
            margin-bottom: 1rem;
            transition: 0.2s;
        }
        .comment-pinned {
            border-left: 4px solid #f4b400;
            background: rgba(244,180,0,0.05);
        }
        .comment-creator-hearted {
            border-right: 4px solid #e91e63;
        }
        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: var(--md-surface-variant);
            border-bottom: 1px solid var(--md-outline);
            border-radius: var(--md-radius-large) var(--md-radius-large) 0 0;
            flex-wrap: wrap;
            gap: 8px;
        }
        .comment-user {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .comment-user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
        }
        .comment-user-name {
            font-weight: 700;
            font-family: var(--font-heading);
        }
        .comment-badge {
            font-size: 0.7rem;
            background: var(--md-primary-container);
            padding: 2px 8px;
            border-radius: 30px;
            color: var(--md-on-primary-container);
            margin-left: 8px;
        }
        .comment-time {
            font-size: 0.75rem;
            color: var(--md-on-surface-variant);
        }
        .comment-actions {
            display: flex;
            gap: 12px;
        }
        .comment-action-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: var(--md-on-surface-variant);
            transition: 0.2s;
        }
        .comment-action-btn:hover {
            color: var(--md-primary);
        }
        .comment-body {
            padding: 1rem 1.5rem;
            font-size: 0.95rem;
            line-height: 1.5;
            word-break: break-word;
        }
        .comment-footer {
            padding: 0.5rem 1.5rem 1rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            border-top: 1px solid var(--md-outline-variant);
        }
        .reply-toggle {
            background: none;
            border: none;
            color: var(--md-primary);
            font-weight: 500;
            cursor: pointer;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .replies-container {
            margin-left: 2rem;
            margin-top: 0.5rem;
            padding-left: 1rem;
            border-left: 2px solid var(--md-outline);
        }
        .edit-textarea {
            width: 100%;
            margin: 8px 0;
            border-radius: 12px;
            padding: 8px;
            border: 1px solid var(--md-outline);
            background: var(--md-surface);
            color: var(--md-on-surface);
        }
        .small-btn {
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 0.75rem;
            background: var(--md-primary);
            color: white;
            border: none;
            margin-right: 6px;
        }
        .loading-spinner-small {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #ccc;
            border-top-color: var(--md-primary);
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-comments {
            text-align: center;
            padding: 2rem;
            color: var(--md-on-surface-variant);
        }
        @media (max-width: 640px) {
            .replies-container { margin-left: 0.5rem; padding-left: 0.5rem; }
            .comment-header { flex-direction: column; align-items: flex-start; }
            .comment-actions { align-self: flex-end; }
        }
    </style>
    <!-- Firebase SDKs (loaded before custom script) -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <!-- Auth.js (global ReverbitAuth) -->
    <script src="https://aditya-cmd-max.github.io/js/auth.js" defer></script>
</head>
<body>
    <!-- Comments section will be injected inside .article-container after article content -->
    <div id="comments-root" style="margin-top: 2rem;"></div>

    <script>
        (function(){
            // ========== FIREBASE INIT ==========
            const firebaseConfig = {
                apiKey: "AIzaSyDE0eix0uVHuUS5P5DbuPA-SZt6pD8ob8A",
                authDomain: "reverbit11.firebaseapp.com",
                databaseURL: "https://reverbit11-default-rtdb.firebaseio.com",
                projectId: "reverbit11",
                storageBucket: "reverbit11.firebasestorage.app",
                messagingSenderId: "607495314412",
                appId: "1:607495314412:web:8c098f88b0d3b4620f7ec9",
                measurementId: "G-DMWMRM1M47"
            };
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            const auth = firebase.auth();
            const db = firebase.database();
            
            // Article identifier (extract from current path or use canonical)
            let ARTICLE_ID = null;
            function getArticleId() {
                // Use canonical URL or pathname as unique article ID (remove trailing slash)
                let path = window.location.pathname.replace(/\/$/, '');
                let segments = path.split('/');
                // fallback: use last segment or full path slug
                let slug = segments[segments.length-1] || 'default-article';
                if(slug === '' || slug === 'index.html') slug = 'homepage';
                // Sanitize: replace unsafe chars
                return slug.replace(/[.#$\[\]]/g, '_');
            }
            ARTICLE_ID = getArticleId();
            
            // State
            let currentUser = null;
            let isAdmin = false;
            let allComments = {};     // raw comments map
            let topLevelComments = []; // sorted top-level
            let currentSort = "newest"; // newest, oldest, mostLiked
            
            // DOM container
            const root = document.getElementById('comments-root');
            if(!root) return;
            
            // Helper: time ago
            function timeAgo(timestamp) {
                if(!timestamp) return 'just now';
                const seconds = Math.floor((Date.now() - timestamp) / 1000);
                if(seconds < 5) return 'just now';
                const intervals = [
                    { label: 'year', seconds: 31536000 },
                    { label: 'month', seconds: 2592000 },
                    { label: 'week', seconds: 604800 },
                    { label: 'day', seconds: 86400 },
                    { label: 'hour', seconds: 3600 },
                    { label: 'minute', seconds: 60 },
                    { label: 'second', seconds: 1 }
                ];
                for(let i of intervals) {
                    const count = Math.floor(seconds / i.seconds);
                    if(count >= 1) {
                        return `${count} ${i.label}${count !== 1 ? 's' : ''} ago`;
                    }
                }
                return 'just now';
            }
            
            // check admin status (admins node)
            async function checkAdmin(uid) {
                if(!uid) return false;
                try {
                    const snapshot = await db.ref(`admins/${uid}`).once('value');
                    return snapshot.exists();
                } catch(e) { return false; }
            }
            
            // Listen auth state
            auth.onAuthStateChanged(async (user) => {
                currentUser = user;
                if(user) {
                    isAdmin = await checkAdmin(user.uid);
                } else {
                    isAdmin = false;
                }
                renderCommentsSection(); // re-render whole UI
            });
            
            // Listen realtime comments for this article
            let commentsRef = null;
            function attachCommentsListener() {
                if(commentsRef) commentsRef.off();
                commentsRef = db.ref(`comments`).orderByChild('articleId').equalTo(ARTICLE_ID);
                commentsRef.on('value', (snapshot) => {
                    const data = snapshot.val() || {};
                    allComments = {};
                    Object.keys(data).forEach(key => {
                        allComments[key] = { id: key, ...data[key] };
                    });
                    buildThreads();
                    renderCommentsSection();
                });
            }
            
            // Build parent-child hierarchy
            function buildThreads() {
                const commentMap = {};
                Object.values(allComments).forEach(c => { commentMap[c.id] = { ...c, replies: [] }; });
                const topLevel = [];
                Object.values(commentMap).forEach(c => {
                    if(c.parentId && commentMap[c.parentId]) {
                        commentMap[c.parentId].replies.push(c);
                    } else {
                        topLevel.push(c);
                    }
                });
                // sort replies inside each comment by timestamp asc
                for(let cid in commentMap) {
                    commentMap[cid].replies.sort((a,b) => (a.timestamp||0) - (b.timestamp||0));
                }
                // sort top-level based on currentSort
                if(currentSort === 'newest') topLevel.sort((a,b) => (b.timestamp||0) - (a.timestamp||0));
                else if(currentSort === 'oldest') topLevel.sort((a,b) => (a.timestamp||0) - (b.timestamp||0));
                else if(currentSort === 'mostLiked') topLevel.sort((a,b) => (b.likes||0) - (a.likes||0));
                topLevelComments = topLevel;
            }
            
            // Like / Dislike (toggle)
            async function toggleLike(commentId, currentUserId) {
                if(!currentUser) { alert('Please sign in to like comments'); return; }
                const commentRef = db.ref(`comments/${commentId}`);
                const snapshot = await commentRef.once('value');
                const comment = snapshot.val();
                if(!comment) return;
                const likedBy = comment.likedBy || {};
                const alreadyLiked = !!likedBy[currentUser.uid];
                let newLikes = comment.likes || 0;
                let newLikedBy = { ...likedBy };
                if(alreadyLiked) {
                    newLikes--;
                    delete newLikedBy[currentUser.uid];
                } else {
                    newLikes++;
                    newLikedBy[currentUser.uid] = true;
                }
                await commentRef.update({ likes: newLikes, likedBy: newLikedBy });
            }
            
            // Delete comment (admin or owner)
            async function deleteComment(commentId, ownerId) {
                if(!currentUser) return;
                if(currentUser.uid !== ownerId && !isAdmin) { alert('Not authorized'); return; }
                // also delete all replies recursively (optional but good UX)
                const replies = Object.values(allComments).filter(c => c.parentId === commentId);
                for(let reply of replies) {
                    await db.ref(`comments/${reply.id}`).remove();
                }
                await db.ref(`comments/${commentId}`).remove();
            }
            
            // Edit comment
            async function editComment(commentId, newText) {
                if(!currentUser) return;
                const comment = allComments[commentId];
                if(!comment || (comment.userId !== currentUser.uid && !isAdmin)) return;
                await db.ref(`comments/${commentId}`).update({
                    text: newText,
                    edited: true,
                    editedTimestamp: Date.now()
                });
            }
            
            // Pin comment (admin only)
            async function togglePin(commentId) {
                if(!isAdmin) return;
                const comment = allComments[commentId];
                if(!comment) return;
                const newPin = !comment.isPinned;
                await db.ref(`comments/${commentId}`).update({ isPinned: newPin });
            }
            
            // Heart by creator (admin only)
            async function toggleCreatorHeart(commentId) {
                if(!isAdmin) return;
                const comment = allComments[commentId];
                if(!comment) return;
                const newHeart = !comment.isCreatorHearted;
                await db.ref(`comments/${commentId}`).update({ isCreatorHearted: newHeart });
            }
            
            // Submit new comment (root or reply)
            async function submitComment(text, parentId = null) {
                if(!currentUser) { alert('You must be signed in to comment.'); return false; }
                if(!text || text.trim().length === 0) return false;
                const newCommentRef = db.ref('comments').push();
                const userProfile = currentUser;
                const userName = userProfile.displayName || userProfile.email?.split('@')[0] || 'Anonymous';
                const userAvatar = userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a73e8&color=fff`;
                const commentObj = {
                    articleId: ARTICLE_ID,
                    userId: currentUser.uid,
                    userName: userName,
                    userAvatar: userAvatar,
                    text: text.trim(),
                    timestamp: Date.now(),
                    likes: 0,
                    likedBy: {},
                    replies: 0,
                    edited: false,
                    parentId: parentId || null,
                    isPinned: false,
                    isCreatorHearted: false
                };
                await newCommentRef.set(commentObj);
                return true;
            }
            
            // Render HTML (full comments UI)
            function renderCommentsSection() {
                if(!root) return;
                let isLoggedIn = !!currentUser;
                let userAvatar = currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'User')}&background=1a73e8&color=fff`;
                
                let html = `<div class="comments-section">
                    <div class="comments-header">
                        <h3 class="comments-title">💬 Comments (${Object.keys(allComments).length})</h3>
                        <div class="comment-sort">
                            <span>Sort by:</span>
                            <select id="commentSortSelect">
                                <option value="newest" ${currentSort==='newest'?'selected':''}>Newest</option>
                                <option value="oldest" ${currentSort==='oldest'?'selected':''}>Oldest</option>
                                <option value="mostLiked" ${currentSort==='mostLiked'?'selected':''}>Most liked</option>
                            </select>
                        </div>
                    </div>`;
                
                // Login prompt if not logged in
                if(!isLoggedIn) {
                    html += `<div class="comment-login-prompt">
                        <i class="fas fa-comment-dots" style="font-size: 2rem; opacity:0.7;"></i>
                        <p>Join the conversation — only Reverbit members can comment.</p>
                        <button class="comment-login-btn" id="commentsLoginBtn"><i class="fas fa-sign-in-alt"></i> Sign in with Reverbit</button>
                    </div>`;
                } else {
                    // Comment form
                    html += `<div class="comment-form-container">
                        <div class="comment-form-header">
                            <img src="${userAvatar}" class="comment-avatar-sm" alt="avatar">
                            <strong>${currentUser.displayName || currentUser.email?.split('@')[0]}</strong>
                        </div>
                        <div class="comment-form-body">
                            <textarea id="newCommentText" class="comment-textarea" rows="2" placeholder="What are your thoughts?"></textarea>
                            <div class="comment-form-actions">
                                <button class="btn-submit" id="submitMainComment">Post comment</button>
                            </div>
                        </div>
                    </div>`;
                }
                
                // Comments list
                if(topLevelComments.length === 0) {
                    html += `<div class="empty-comments">✨ No comments yet. Be the first to share your thoughts!</div>`;
                } else {
                    topLevelComments.forEach(comment => {
                        html += renderCommentThread(comment, 0);
                    });
                }
                html += `</div>`;
                root.innerHTML = html;
                
                // attach sort listener
                const sortSelect = document.getElementById('commentSortSelect');
                if(sortSelect) {
                    sortSelect.addEventListener('change', (e) => {
                        currentSort = e.target.value;
                        buildThreads();
                        renderCommentsSection();
                    });
                }
                // login button
                const loginBtn = document.getElementById('commentsLoginBtn');
                if(loginBtn && !isLoggedIn && window.ReverbitAuth && window.ReverbitAuth.signInWithGoogle) {
                    loginBtn.addEventListener('click', () => {
                        window.ReverbitAuth.signInWithGoogle?.();
                    });
                } else if(loginBtn && !isLoggedIn) {
                    loginBtn.addEventListener('click', () => { window.location.href = 'https://aditya-cmd-max.github.io/signin'; });
                }
                // submit main comment
                const submitBtn = document.getElementById('submitMainComment');
                const textarea = document.getElementById('newCommentText');
                if(submitBtn && textarea && isLoggedIn) {
                    submitBtn.addEventListener('click', async () => {
                        const val = textarea.value.trim();
                        if(!val) return;
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span class="loading-spinner-small"></span> Posting...';
                        await submitComment(val, null);
                        textarea.value = '';
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Post comment';
                    });
                }
                // Attach reply, edit, delete, like, pin, heart listeners dynamically
                attachActionListeners();
            }
            
            function renderCommentThread(comment, depth = 0) {
                const isOwner = currentUser && comment.userId === currentUser.uid;
                const canModerate = isAdmin || isOwner;
                const timeStr = timeAgo(comment.timestamp);
                const likeCount = comment.likes || 0;
                const userLiked = currentUser && comment.likedBy && comment.likedBy[currentUser.uid];
                const pinnedClass = comment.isPinned ? 'comment-pinned' : '';
                const heartedClass = comment.isCreatorHearted ? 'comment-creator-hearted' : '';
                let repliesHtml = '';
                if(comment.replies && comment.replies.length) {
                    repliesHtml = `<div class="replies-container">`;
                    comment.replies.forEach(reply => {
                        repliesHtml += renderCommentThread(reply, depth+1);
                    });
                    repliesHtml += `</div>`;
                }
                return `<div class="comment-thread" data-comment-id="${comment.id}">
                    <div class="comment-card ${pinnedClass} ${heartedClass}">
                        <div class="comment-header">
                            <div class="comment-user">
                                <img src="${comment.userAvatar || 'https://ui-avatars.com/api/?name=User'}" class="comment-user-avatar">
                                <div>
                                    <span class="comment-user-name">${escapeHtml(comment.userName)}</span>
                                    ${comment.isPinned ? '<span class="comment-badge">📌 Pinned</span>' : ''}
                                    ${comment.isCreatorHearted ? '<span class="comment-badge">❤️ Creator heart</span>' : ''}
                                    ${comment.edited ? '<span class="comment-badge">✏️ Edited</span>' : ''}
                                    <div class="comment-time">${timeStr}</div>
                                </div>
                            </div>
                            <div class="comment-actions">
                                <button class="comment-action-btn like-btn" data-id="${comment.id}">👍 <span class="like-count">${likeCount}</span></button>
                                <button class="comment-action-btn reply-btn" data-id="${comment.id}">💬 Reply</button>
                                ${canModerate ? `<button class="comment-action-btn edit-btn" data-id="${comment.id}">✏️ Edit</button>` : ''}
                                ${canModerate ? `<button class="comment-action-btn delete-btn" data-id="${comment.id}">🗑️ Delete</button>` : ''}
                                ${isAdmin ? `<button class="comment-action-btn pin-btn" data-id="${comment.id}">${comment.isPinned ? '📌 Unpin' : '📌 Pin'}</button>` : ''}
                                ${isAdmin ? `<button class="comment-action-btn heart-btn" data-id="${comment.id}">${comment.isCreatorHearted ? '💔 Remove heart' : '❤️ Heart'}</button>` : ''}
                            </div>
                        </div>
                        <div class="comment-body" id="comment-body-${comment.id}">
                            ${escapeHtml(comment.text)}
                        </div>
                        <div class="comment-footer">
                            <button class="reply-toggle" data-id="${comment.id}">💬 Reply</button>
                        </div>
                        <div id="reply-form-${comment.id}" style="display:none; padding:0 1rem 1rem 1rem;">
                            <textarea class="comment-textarea reply-textarea" rows="2" placeholder="Write a reply..."></textarea>
                            <div style="display:flex; gap:8px; justify-content:flex-end;">
                                <button class="small-btn cancel-reply" data-id="${comment.id}">Cancel</button>
                                <button class="small-btn submit-reply" data-id="${comment.id}">Reply</button>
                            </div>
                        </div>
                    </div>
                    ${repliesHtml}
                </div>`;
            }
            
            function attachActionListeners() {
                // like buttons
                document.querySelectorAll('.like-btn').forEach(btn => {
                    btn.removeEventListener('click', likeHandler);
                    btn.addEventListener('click', likeHandler);
                });
                // reply toggle (show form)
                document.querySelectorAll('.reply-toggle, .reply-btn').forEach(btn => {
                    btn.removeEventListener('click', replyToggleHandler);
                    btn.addEventListener('click', replyToggleHandler);
                });
                // submit reply
                document.querySelectorAll('.submit-reply').forEach(btn => {
                    btn.removeEventListener('click', submitReplyHandler);
                    btn.addEventListener('click', submitReplyHandler);
                });
                document.querySelectorAll('.cancel-reply').forEach(btn => {
                    btn.removeEventListener('click', cancelReplyHandler);
                    btn.addEventListener('click', cancelReplyHandler);
                });
                // edit
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.removeEventListener('click', editHandler);
                    btn.addEventListener('click', editHandler);
                });
                // delete
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.removeEventListener('click', deleteHandler);
                    btn.addEventListener('click', deleteHandler);
                });
                // pin admin
                document.querySelectorAll('.pin-btn').forEach(btn => {
                    btn.removeEventListener('click', pinHandler);
                    btn.addEventListener('click', pinHandler);
                });
                // heart admin
                document.querySelectorAll('.heart-btn').forEach(btn => {
                    btn.removeEventListener('click', heartHandler);
                    btn.addEventListener('click', heartHandler);
                });
            }
            
            function likeHandler(e) {
                const btn = e.currentTarget;
                const commentId = btn.dataset.id;
                if(commentId && currentUser) toggleLike(commentId, currentUser.uid);
                else if(!currentUser) alert('Sign in to like comments');
            }
            function replyToggleHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                const formDiv = document.getElementById(`reply-form-${commentId}`);
                if(formDiv) formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
            }
            async function submitReplyHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                const container = document.getElementById(`reply-form-${commentId}`);
                const textarea = container?.querySelector('.reply-textarea');
                const replyText = textarea?.value.trim();
                if(!replyText) return;
                const btn = e.currentTarget;
                btn.disabled = true;
                btn.innerHTML = '...';
                await submitComment(replyText, commentId);
                textarea.value = '';
                if(container) container.style.display = 'none';
                btn.disabled = false;
                btn.innerHTML = 'Reply';
            }
            function cancelReplyHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                const formDiv = document.getElementById(`reply-form-${commentId}`);
                if(formDiv) formDiv.style.display = 'none';
            }
            function editHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                const comment = allComments[commentId];
                if(!comment) return;
                const bodyDiv = document.getElementById(`comment-body-${commentId}`);
                const originalText = comment.text;
                const textarea = document.createElement('textarea');
                textarea.className = 'edit-textarea';
                textarea.value = originalText;
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.className = 'small-btn';
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel';
                cancelBtn.className = 'small-btn';
                const container = document.createElement('div');
                container.appendChild(textarea);
                container.appendChild(saveBtn);
                container.appendChild(cancelBtn);
                bodyDiv.innerHTML = '';
                bodyDiv.appendChild(container);
                saveBtn.onclick = async () => {
                    const newText = textarea.value.trim();
                    if(newText && newText !== originalText) {
                        await editComment(commentId, newText);
                    }
                    renderCommentsSection(); // refresh
                };
                cancelBtn.onclick = () => renderCommentsSection();
            }
            function deleteHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                const comment = allComments[commentId];
                if(!comment) return;
                if(confirm('Delete this comment? Replies will also be removed.')) {
                    deleteComment(commentId, comment.userId);
                }
            }
            function pinHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                togglePin(commentId);
            }
            function heartHandler(e) {
                const commentId = e.currentTarget.dataset.id;
                toggleCreatorHeart(commentId);
            }
            
            function escapeHtml(str) {
                if(!str) return '';
                return str.replace(/[&<>]/g, function(m) {
                    if(m === '&') return '&amp;';
                    if(m === '<') return '&lt;';
                    if(m === '>') return '&gt;';
                    return m;
                }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
                    return c;
                });
            }
            
            // initial fetch and listener
            attachCommentsListener();
            // wait for auth.js to possibly set user after page load (already handled by onAuthStateChanged)
        })();
    </script>
    <!-- insert comment section right after article content? We already placed root after main content -->
    <style>
        /* make sure comments appear inside article container */
        #comments-root {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 16px;
        }
        @media (min-width: 768px) {
            #comments-root { padding: 0 20px; }
        }
        .article-container + #comments-root {
            margin-top: 0;
        }
    </style>
</body>
</html>
