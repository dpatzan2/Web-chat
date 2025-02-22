// Mobile view handling
function isMobileView() {
    return window.innerWidth <= 768;
}

function showChat() {
    if (isMobileView()) {
        const sidebar = document.querySelector('.sidebar');
        const chatContainer = document.querySelector('.chat-container');
        const mobileNav = document.querySelector('.mobile-nav');
        
        sidebar.style.display = 'none';
        chatContainer.style.display = 'flex';
        chatContainer.style.transform = 'translateX(0)';
        mobileNav.style.display = 'none';
        
        // Add back button if it doesn't exist
        if (!document.querySelector('.back-button')) {
            const backButton = document.createElement('button');
            backButton.className = 'back-button';
            backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
            backButton.addEventListener('click', hideChat);
            document.querySelector('.chat-header').insertBefore(backButton, document.querySelector('.user-info'));
        }
    }
}

function hideChat() {
    if (isMobileView()) {
        const sidebar = document.querySelector('.sidebar');
        const chatContainer = document.querySelector('.chat-container');
        const mobileNav = document.querySelector('.mobile-nav');
        
        sidebar.style.display = 'flex';
        chatContainer.classList.remove('active');
        chatContainer.style.transform = 'translateX(100%)';
        mobileNav.style.display = 'flex';
    }
}

// Initialize mobile view
function initMobileView() {
    if (isMobileView()) {
        hideChat();
        
        // Add click event to all chat items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                showChat();
                // Update active chat item
                document.querySelectorAll('.chat-item').forEach(chat => chat.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
}

// Add resize listener to handle view changes
window.addEventListener('resize', initMobileView);
// Initialize on page load
document.addEventListener('DOMContentLoaded', initMobileView);

// Message and Status enums
const MessageType = {
    TEXT: 'text',
    IMAGE: 'image',
    AUDIO: 'audio',
    VIDEO: 'video',
    FILE: 'file'
};

const MessageStatus = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read'
};

// Message handling functions
function createMessage(content, sent, type = MessageType.TEXT) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sent ? 'sent' : 'received'}`;
    let messageContent = '';

    switch (type) {
        case MessageType.IMAGE:
            messageContent = `<img src="${content}" alt="Shared image" class="message-image">`;
            break;
        case MessageType.AUDIO:
            messageContent = `
                <audio controls>
                    <source src="${content}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>`;
            break;
        case MessageType.VIDEO:
            messageContent = `
                <div class="video-message">
                    <video class="video-player">
                        <source src="${content}" type="video/mp4">
                        <source src="${content.replace(/\.[^.]+$/, '.webm')}" type="video/webm">
                        <source src="${content.replace(/\.[^.]+$/, '.mkv')}" type="video/x-matroska">
                        <source src="${content.replace(/\.[^.]+$/, '.mov')}" type="video/quicktime">
                        <source src="${content.replace(/\.[^.]+$/, '.avi')}" type="video/x-msvideo">
                        <source src="${content.replace(/\.[^.]+$/, '.wmv')}" type="video/x-ms-wmv">
                        <source src="${content.replace(/\.[^.]+$/, '.flv')}" type="video/x-flv">
                        <source src="${content.replace(/\.[^.]+$/, '.3gp')}" type="video/3gpp">
                        Your browser does not support this video format.
                    </video>
                    <div class="video-controls">
                        <button class="video-play-pause"><i class="fas fa-play"></i></button>
                        <div class="video-timeline">
                            <div class="video-progress"></div>
                        </div>
                        <span class="video-time">0:00</span>
                        <button class="video-fullscreen"><i class="fas fa-expand"></i></button>
                    </div>
                </div>`;
            break;
        case MessageType.FILE:
            const fileName = content.split('/').pop();
            messageContent = `
                <div class="file-attachment">
                    <i class="fas fa-file"></i>
                    <a href="${content}" target="_blank">${fileName}</a>
                </div>`;
            break;
        default:
            messageContent = `<div class="message-content">${content}</div>`;
    }

    messageDiv.innerHTML = `
        ${messageContent}
        <div class="message-status">
            <span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            ${sent ? '<i class="fas fa-check"></i>' : ''}
        </div>
    `;
    return messageDiv;
}

function updateMessageStatus(messageDiv, status) {
    const statusIcon = messageDiv.querySelector('.message-status i');
    if (statusIcon) {
        statusIcon.className = 'fas';
        switch (status) {
            case MessageStatus.SENT:
                statusIcon.className += ' fa-check';
                break;
            case MessageStatus.DELIVERED:
                statusIcon.className += ' fa-check-double';
                break;
            case MessageStatus.READ:
                statusIcon.className += ' fa-check-double read';
                break;
        }
    }
}

function updateChatPreview(chatItem, message) {
    const preview = chatItem.querySelector('p');
    const previewContent = getPreviewContent(message);
    preview.innerHTML = previewContent;
    const time = chatItem.querySelector('.time');
    time.textContent = message.time;

    // Update unread count if needed
    const unreadSpan = chatItem.querySelector('.unread');
    if (unreadSpan && !message.sent) {
        const currentCount = parseInt(unreadSpan.textContent) || 0;
        unreadSpan.textContent = currentCount + 1;
    }
}

function getPreviewContent(message) {
    switch (message.type) {
        case MessageType.IMAGE:
            return '📷 Photo';
        case MessageType.AUDIO:
            const duration = message.duration || '0:30';
            return `🎵 Voice message (${duration})`;
        case MessageType.FILE:
            const fileName = message.content.split('/').pop();
            return `📎 ${fileName}`;
        default:
            // Truncate long text messages
            return message.content.length > 30 ? 
                   message.content.substring(0, 30) + '...' : 
                   message.content;
    }
}

// Create fullscreen viewer element
const fullscreenViewer = document.createElement('div');
fullscreenViewer.className = 'fullscreen-viewer';
fullscreenViewer.innerHTML = `
    <button class="close-button"><i class="fas fa-times"></i></button>
    <img src="" alt="Fullscreen image">
`;
document.body.appendChild(fullscreenViewer);

// Handle fullscreen image view
function openFullscreenImage(imageSrc) {
    const fullscreenImg = fullscreenViewer.querySelector('img');
    fullscreenImg.src = imageSrc;
    fullscreenViewer.classList.add('active');
}

// Close fullscreen view
fullscreenViewer.querySelector('.close-button').addEventListener('click', () => {
    fullscreenViewer.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar elementos del DOM (definir cada variable una sola vez)
    const chatItems = document.querySelectorAll('.chat-item');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const chatContainer = document.querySelector('.chat-container');
    const sendButton = document.getElementById('sendButton');

    // Add click event listener for message images
    chatMessages.addEventListener('click', (e) => {
        if (e.target.classList.contains('message-image')) {
            openFullscreenImage(e.target.src);
        }
    });
    const themeToggle = document.getElementById('themeToggle');
    const themeSwitch = document.getElementById('themeSwitch');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const navButtons = document.querySelectorAll('.nav-btn');
    const emojiButton = document.getElementById('emojiButton');
    const chatHeader = document.querySelector('.chat-header');
    const isMobile = window.innerWidth <= 768;

    // Al hacer click en un chat item
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            // Quitar clase active de todos y agregar a la selección
            chatItems.forEach(chat => chat.classList.remove('active'));
            this.classList.add('active');

            // Actualizar información del encabezado del chat
            const contactName = this.querySelector('h4').textContent;
            const contactImage = this.querySelector('img').src;
            document.querySelector('.chat-header .user-details h3').textContent = contactName;
            document.querySelector('.chat-header .profile-pic').src = contactImage;

            // Limpiar mensajes actuales y mostrar el historial correspondiente
            chatMessages.innerHTML = '';
            displayChatHistory(contactName);

            // Mostrar contenedor de chat en móvil
            if (isMobile) {
                chatContainer.classList.add('active');
            }
        });
    });

    // Elementos del Story Viewer
    const storyViewer = document.getElementById('storyViewer');
    const storyImage = storyViewer.querySelector('.story-image');
    const storyUsername = storyViewer.querySelector('.story-username');
    const storyTime = storyViewer.querySelector('.story-time');
    const closeStoryButton = storyViewer.querySelector('.close-story');
    const statusItems = document.querySelectorAll('.status-item');
    let currentStoryTimeout;

    // Función para mostrar story
    function showStory(username, imageUrl, time) {
        storyViewer.classList.remove('hidden');
        storyImage.src = imageUrl;
        storyUsername.textContent = username;
        storyTime.textContent = time;

        // Reiniciar y comenzar la animación de progreso
        const progress = storyViewer.querySelector('.story-progress');
        progress.style.animation = 'none';
        progress.offsetHeight; // Forzar reflow
        progress.style.animation = null;

        // Cerrar automáticamente después de 5 segundos
        clearTimeout(currentStoryTimeout);
        currentStoryTimeout = setTimeout(() => {
            storyViewer.classList.add('hidden');
        }, 5000);
    }

    // Asignar evento a cada status item (excepto "My Status")
    statusItems.forEach(item => {
        if (!item.querySelector('h4').textContent.includes('My Status')) {
            item.addEventListener('click', () => {
                const username = item.querySelector('h4').textContent;
                const time = item.querySelector('p').textContent;
                const imageUrl = item.querySelector('img').src;
                showStory(username, imageUrl, time);
            });
        }
    });

    // Cerrar el story viewer al hacer click en el botón de cerrar
    closeStoryButton.addEventListener('click', () => {
        storyViewer.classList.add('hidden');
        clearTimeout(currentStoryTimeout);
    });

    // Navegación por teclado para cerrar stories (Escape)
    document.addEventListener('keydown', (e) => {
        if (!storyViewer.classList.contains('hidden') && e.key === 'Escape') {
            storyViewer.classList.add('hidden');
            clearTimeout(currentStoryTimeout);
        }
    });

    // Almacenamiento de historiales de chat en un Map
    const chatHistories = new Map();

    // Inicializar historiales de chat con algunos mensajes
    chatItems.forEach(item => {
        const userName = item.querySelector('h4').textContent;
        const initialMessage = item.querySelector('p').textContent;
        const initialTime = item.querySelector('.time').textContent;
        const unreadCount = item.querySelector('.unread')?.textContent;

        // Create initial message based on preview content
        let messageType = MessageType.TEXT;
        let messageContent = initialMessage;

        if (initialMessage.includes('📷')) {
            messageType = MessageType.IMAGE;
            messageContent = 'user-photo.jpg'; // Placeholder URL
        } else if (initialMessage.includes('🎵')) {
            messageType = MessageType.AUDIO;
            messageContent = 'voice-message.mp3'; // Placeholder URL
        } else if (initialMessage.includes('📎')) {
            messageType = MessageType.FILE;
            messageContent = initialMessage.replace('📎 ', '');
        }

        chatHistories.set(userName, [{
            type: messageType,
            content: messageContent,
            sent: false,
            time: initialTime,
            status: MessageStatus.READ
        }]);
    });

    function displayChatHistory(userName) {
        chatMessages.innerHTML = '';
        const history = chatHistories.get(userName) || [];
        history.forEach(msg => {
            const messageDiv = createMessage(msg.content, msg.sent, msg.type);
            if (msg.sent) {
                updateMessageStatus(messageDiv, msg.status);
            }
            chatMessages.appendChild(messageDiv);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addMessageToHistory(userName, content, sent, type = MessageType.TEXT) {
        if (!chatHistories.has(userName)) {
            chatHistories.set(userName, []);
        }
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const message = { type, content, sent, time, status: MessageStatus.SENT };
        chatHistories.get(userName).push(message);

        // Actualizar vista previa del chat
        const chatItem = Array.from(chatItems).find(item => 
            item.querySelector('h4').textContent === userName
        );
        if (chatItem) {
            updateChatPreview(chatItem, message);
        }
    }

    function handleSendMessage() {
        const text = messageInput.value.trim();
        const currentChat = document.querySelector('.chat-header h3').textContent;

        if (text && currentChat) {
            const messageDiv = createMessage(text, true);
            addMessageToHistory(currentChat, text, true);
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            messageInput.value = '';

            // Simular actualización de estado del mensaje
            setTimeout(() => updateMessageStatus(messageDiv, MessageStatus.DELIVERED), 1000);
            setTimeout(() => {
                updateMessageStatus(messageDiv, MessageStatus.READ);

                // Simular mensaje recibido
                const response = `Thanks for your message! This is an automated response from ${currentChat} 👋`;
                addMessageToHistory(currentChat, response, false);
                const responseDiv = createMessage(response, false);
                chatMessages.appendChild(responseDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 2000);
        }
    }

    // Inicializar botón de emojis usando EmojiButton
    const picker = new EmojiButton({
        position: 'top-start'
    });
    picker.on('emoji', emoji => {
        messageInput.value += emoji;
        messageInput.focus();
    });
    emojiButton.addEventListener('click', () => {
        picker.togglePicker(emojiButton);
    });

    // Asignar eventos para enviar mensajes
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Función para alternar el tema (claro/oscuro)
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeSwitch.checked = isDark;

        // Actualizar el color de fondo del contenedor y mensajes
        if (isDark) {
            chatContainer.style.backgroundColor = '#222e35';
            chatMessages.style.backgroundColor = '#0c1317';
        } else {
            chatContainer.style.backgroundColor = 'white';
            chatMessages.style.backgroundColor = '#e5ddd5';
        }
    }
    themeToggle.addEventListener('click', toggleTheme);
    themeSwitch.addEventListener('change', toggleTheme);

    // Función para cambiar de pestaña
    function switchTab(tabId) {
        // Ocultar todos los contenidos de pestaña
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        // Mostrar el contenido de la pestaña seleccionada
        const selectedTab = document.getElementById(tabId + 'Tab');
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }

        // Actualizar estado activo de botones de pestaña y navegación móvil
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // En móvil, ocultar el contenedor de chat si no es la pestaña de chats
        if (isMobile && tabId !== 'chats') {
            chatContainer.classList.remove('active');
        }

        // Para la vista móvil, actualizar clases en el body
        if (isMobile) {
            document.body.className = ''; // Limpiar todas las clases
            document.body.classList.add('show-' + tabId);
        }
    }

    // Eventos para cambio de pestaña
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    

    // Agregar botón "Atrás" en el encabezado del chat para dispositivos móviles
    if (isMobile) {
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backButton.addEventListener('click', () => {
            chatContainer.classList.remove('active');
        });
        chatHeader.insertBefore(backButton, chatHeader.firstChild);
    }

    // Inicializar con la pestaña "chats"
    switchTab('chats');

    // Configurar el tema según la preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        toggleTheme();
    }

    // Add voice recording functionality
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;

    // Create voice recording button
    const voiceButton = document.createElement('button');
    voiceButton.id = 'voiceButton';
    voiceButton.className = 'voice-button';
    voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    document.querySelector('.chat-input').insertBefore(voiceButton, messageInput);

    // Handle voice recording
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const currentChat = document.querySelector('.chat-header h3').textContent;

                const messageDiv = createMessage(audioUrl, true, MessageType.AUDIO);
                addMessageToHistory(currentChat, audioUrl, true, MessageType.AUDIO);
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Simulate message status updates
                setTimeout(() => updateMessageStatus(messageDiv, MessageStatus.DELIVERED), 1000);
                setTimeout(() => updateMessageStatus(messageDiv, MessageStatus.READ), 2000);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            });

            mediaRecorder.start();
            isRecording = true;
            voiceButton.classList.add('recording');
            voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Error accessing microphone. Please make sure you have granted microphone permissions.');
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            voiceButton.classList.remove('recording');
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    voiceButton.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    // Handle video player functionality
    chatMessages.addEventListener('click', (e) => {
        const videoMessage = e.target.closest('.video-message');
        if (videoMessage) {
            const video = videoMessage.querySelector('.video-player');
            const playPauseBtn = videoMessage.querySelector('.video-play-pause');
            const timeline = videoMessage.querySelector('.video-timeline');
            const progress = videoMessage.querySelector('.video-progress');
            const timeDisplay = videoMessage.querySelector('.video-time');
            const fullscreenBtn = videoMessage.querySelector('.video-fullscreen');

            if (e.target.closest('.video-play-pause')) {
                if (video.paused) {
                    video.play();
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    video.pause();
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            } else if (e.target.closest('.video-timeline')) {
                const timelineRect = timeline.getBoundingClientRect();
                const clickPosition = (e.clientX - timelineRect.left) / timelineRect.width;
                video.currentTime = clickPosition * video.duration;
            } else if (e.target.closest('.video-fullscreen')) {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    video.requestFullscreen();
                }
            }
        }
    });

    // Update video progress and time
    chatMessages.addEventListener('timeupdate', (e) => {
        if (e.target.matches('.video-player')) {
            const video = e.target;
            const videoMessage = video.closest('.video-message');
            const progress = videoMessage.querySelector('.video-progress');
            const timeDisplay = videoMessage.querySelector('.video-time');

            const progressPercent = (video.currentTime / video.duration) * 100;
            progress.style.width = progressPercent + '%';

            const minutes = Math.floor(video.currentTime / 60);
            const seconds = Math.floor(video.currentTime % 60);
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, true);

    // Add file input for attachments
    const attachmentInput = document.createElement('input');
    attachmentInput.type = 'file';
    attachmentInput.multiple = true;
    attachmentInput.accept = 'image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx';
    attachmentInput.style.display = 'none';
    document.body.appendChild(attachmentInput);

    // Add attachment button
    const attachButton = document.createElement('button');
    attachButton.id = 'attachButton';
    attachButton.className = 'attach-button';
    attachButton.innerHTML = '<i class="fas fa-paperclip"></i>';
    document.querySelector('.chat-input').insertBefore(attachButton, messageInput);

    // Handle file attachment
    attachButton.addEventListener('click', () => {
        attachmentInput.click();
    });

    attachmentInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files.length) return;

        const currentChat = document.querySelector('.chat-header h3').textContent;
        
        Array.from(files).forEach(file => {
       
            const fileUrl = URL.createObjectURL(file);
            let messageType;

            if (file.type.startsWith('image/')) {
                messageType = MessageType.IMAGE;
            } else if (file.type.startsWith('audio/')) {
                messageType = MessageType.AUDIO;
            } else {
                messageType = MessageType.FILE;
            }

            const messageDiv = createMessage(fileUrl, true, messageType);
            addMessageToHistory(currentChat, fileUrl, true, messageType);
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Simulate message status updates
            setTimeout(() => updateMessageStatus(messageDiv, MessageStatus.DELIVERED), 1000);
            setTimeout(() => updateMessageStatus(messageDiv, MessageStatus.READ), 2000);
        });

        // Clear the input
        attachmentInput.value = '';
    });
});
