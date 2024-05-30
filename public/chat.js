(function(){
    const app = document.querySelector(".app");
    const socket = io();
    let uName;
    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value;
        if(username.length === 0){
            return;
        }
        socket.emit("newUser", username);
        uName = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });
    app.querySelector(".chat-screen #send-message").addEventListener("click", function(){
        let message = app.querySelector(".chat-screen #message-input").value;
        if(message.length === 0){
            return;
        }
        renderMessage("my", {
            username:uName,
            text:message
        });
        socket.emit("chat", {
            username:uName,
            text:message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });
    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        if(type === "my"){
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message,text}</div>
                </div>
            `;
            messageContainer.appendChild(el);
        }else if(type === "other"){
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message,text}</div>
                </div>
            `;
            messageContainer.appendChild(el);

        }else if(type === "update"){
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTo = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();