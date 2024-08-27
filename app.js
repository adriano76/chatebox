// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdDAVhQm0k2SVBE0ORLxQZsDH9bvaaW4g",
  authDomain: "chate-box-2.firebaseapp.com",
  projectId: "chate-box-2",
  storageBucket: "chate-box-2.appspot.com",
  messagingSenderId: "163999853321",
  appId: "1:163999853321:web:b19ffd300e5c919d13c1d8",
  measurementId: "G-7PY3FD8DNX"
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Referência ao banco de dados para o chatbot
const botCollection = db.collection("chatebox2");

function handleKeyPress(event) {
    if (event.key === "Enter") {
        const userInput = document.getElementById("user-input").value;
        document.getElementById("user-input").value = "";
        addMessage(userInput, "user-message");
        processMessage(userInput);
    }
}

function addMessage(text, className, options = {}) {
    try {
        // Verificar se o texto é uma string e se className é uma string válida
        if (typeof text !== 'string' || typeof className !== 'string') {
            throw new Error("Parâmetros 'text' e 'className' devem ser strings.");
        }

        // Criar o contêiner da mensagem
        const messageContainer = document.createElement("div");
        messageContainer.className = `message ${className}`;

        // Permitir conteúdo HTML ou texto puro baseado em uma opção
        if (options.allowHTML) {
            messageContainer.innerHTML = text;
        } else {
            messageContainer.innerText = text;
        }

        // Adicionar suporte a mídia (imagens, vídeos, etc.) baseado em uma opção
        if (options.media) {
            const mediaElement = document.createElement(options.media.type);
            mediaElement.src = options.media.src;
            mediaElement.className = 'message-media';
            messageContainer.appendChild(mediaElement);
        }

        // Adicionar a mensagem ao contêiner principal
        const messagesElement = document.getElementById("messages");
        if (!messagesElement) {
            throw new Error("Elemento com ID 'messages' não encontrado no DOM.");
        }
        messagesElement.appendChild(messageContainer);

        // Animação de fade-in
        messageContainer.style.opacity = 0;
        requestAnimationFrame(() => {
            messageContainer.style.transition = "opacity 0.5s";
            messageContainer.style.opacity = 1;
        });

        // Rolar o contêiner para a última mensagem
        messagesElement.scrollTop = messagesElement.scrollHeight;

        // Log para fins de depuração
        console.log("Mensagem adicionada:", { text, className, options });
    } catch (error) {
        console.error("Erro ao adicionar mensagem:", error);
    }
}


async function processMessage(userInput) {
    const botResponse = await getBotResponse(userInput);
    addMessage(botResponse, "bot-message");
    saveConversation(userInput, botResponse);
}

async function getBotResponse(userInput) {
    // Verifica se já existe uma resposta para esta entrada no banco de dados
    const querySnapshot = await botCollection.where("question", "==", userInput).get();
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().response;
    }

    // Se não encontrar no banco de dados, tenta usar NLP para gerar uma resposta
    const nlpResponse = await getNlpResponse(userInput);
    return nlpResponse || "Desculpe, ainda estou aprendendo. Vou me lembrar desta pergunta!";
}

async function getNlpResponse(userInput) {
    try {
        const response = await fetch('https://dialogflow.googleapis.com/v2/projects/YOUR_PROJECT_ID/agent/sessions/123456:detectIntent', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queryInput: {
                    text: {
                        text: userInput,
                        languageCode: 'pt-BR'
                    }
                }
            })
        });

        const data = await response.json();
        if (data.queryResult && data.queryResult.fulfillmentText) {
            return data.queryResult.fulfillmentText;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao processar NLP: ", error);
        return null;
    }
}

function saveConversation(question, response) {
    // Salva a nova pergunta e resposta no banco de dados
    botCollection.add({
        question: question,
        response: response
    });
}

// Atualize seu ambiente
// Certifique-se de que o código está em um ambiente de desenvolvimento compatível com ES6.
// Por exemplo, usando um bundler como Webpack ou Rollup, que suporte a importação de módulos.

// Teste o funcionamento
// Verifique se as interações com o chatbot estão sendo armazenadas e recuperadas corretamente do Firestore.
// - Abra o console do navegador e interaja com o chatbot.
// - Verifique se as respostas estão sendo exibidas corretamente.
// - Confira o console para ver se há erros relacionados ao Firestore ou à integração com o Dialogflow.
// - Acesse o Firebase Console > Firestore e veja se as conversas estão sendo armazenadas na coleção "chatebox2".
