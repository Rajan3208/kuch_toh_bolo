class VoiceAssistant {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.initializeSpeechRecognition();
        this.initializeVisualizer();
        this.setupEventListeners();
        this.agents = {
            browser: new BrowserAgent(),
            search: new SearchAgent(),
            system: new SystemAgent(),
            task: new TaskAgent()
        };
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            this.updateResponse('Speech recognition not supported in this browser.');
            return;
        }

        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
            this.updateStatus('voiceStatus', 'LISTENING');
            this.startVisualizer();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.processCommand(finalTranscript);
            } else {
                this.updateCommand(interimTranscript);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
            this.updateStatus('voiceStatus', 'READY');
            this.stopVisualizer();
        };

        this.recognition.onerror = (event) => {
            this.updateResponse(`Error: ${event.error}`);
            this.isListening = false;
            this.updateUI();
        };
    }

    setupEventListeners() {
        document.getElementById('voiceBtn').addEventListener('click', () => {
            this.toggleListening();
        });
    }

    toggleListening() {
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateUI() {
        const btn = document.getElementById('voiceBtn');
        const status = document.getElementById('listeningStatus');
        
        if (this.isListening) {
            btn.classList.add('active');
            btn.innerHTML = '🔴';
            status.textContent = 'Listening...';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🎤';
            status.textContent = 'Click to start listening';
        }
    }

    updateCommand(text) {
        document.getElementById('commandText').textContent = text;
    }

    updateResponse(text) {
        document.getElementById('responseText').textContent = text;
    }

    updateStatus(elementId, status) {
        document.getElementById(elementId).textContent = status;
    }

    speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        this.synthesis.speak(utterance);
    }

    async processCommand(command) {
        this.updateCommand(command);
        
        const lowerCommand = command.toLowerCase();
        
        // Determine which agent should handle the command
        if (this.isBrowserCommand(lowerCommand)) {
            await this.activateAgent('browser', command);
        } else if (this.isSearchCommand(lowerCommand)) {
            await this.activateAgent('search', command);
        } else if (this.isSystemCommand(lowerCommand)) {
            await this.activateAgent('system', command);
        } else {
            await this.activateAgent('task', command);
        }
    }

    isBrowserCommand(command) {
        const browserKeywords = ['open', 'navigate', 'go to', 'visit', 'browser', 'tab', 'window', 'close', 'refresh'];
        return browserKeywords.some(keyword => command.includes(keyword));
    }

    isSearchCommand(command) {
        const searchKeywords = ['search', 'find', 'look up', 'google', 'bing', 'what is', 'who is', 'how to'];
        return searchKeywords.some(keyword => command.includes(keyword));
    }

    isSystemCommand(command) {
        const systemKeywords = ['time', 'date', 'weather', 'calculator', 'volume', 'brightness', 'ip address'];
        return systemKeywords.some(keyword => command.includes(keyword));
    }

    async activateAgent(agentType, command) {
        const agent = this.agents[agentType];
        const agentElement = document.getElementById(`${agentType}Agent`);
        const statusElement = agentElement.querySelector('.agent-status');
        
        // Activate agent UI
        statusElement.textContent = 'Processing...';
        statusElement.classList.add('active');
        
        try {
            const response = await agent.execute(command);
            this.updateResponse(response);
            this.speak(response);
        } catch (error) {
            const errorMsg = `Error in ${agentType} agent: ${error.message}`;
            this.updateResponse(errorMsg);
        }
        
        // Deactivate agent UI
        setTimeout(() => {
            statusElement.textContent = 'Standby';
            statusElement.classList.remove('active');
        }, 2000);
    }

    initializeVisualizer() {
        const visualizer = document.getElementById('visualizer');
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = '10px';
            visualizer.appendChild(bar);
        }
    }

    startVisualizer() {
        const bars = document.querySelectorAll('.bar');
        this.visualizerInterval = setInterval(() => {
            bars.forEach(bar => {
                const height = Math.random() * 80 + 10;
                bar.style.height = height + 'px';
            });
        }, 100);
    }

    stopVisualizer() {
        if (this.visualizerInterval) {
            clearInterval(this.visualizerInterval);
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.height = '10px';
            });
        }
    }
}

class BrowserAgent {
    async execute(command) {
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('google')) {
            window.open('https://www.google.com', '_blank');
            return 'Opening Google for you.';
        } else if (lowerCommand.includes('youtube')) {
            window.open('https://www.youtube.com', '_blank');
            return 'Opening YouTube for you.';
        } else if (lowerCommand.includes('facebook')) {
            window.open('https://www.facebook.com', '_blank');
            return 'Opening Facebook for you.';
        } else if (lowerCommand.includes('twitter')) {
            window.open('https://www.twitter.com', '_blank');
            return 'Opening Twitter for you.';
        } else if (lowerCommand.includes('github')) {
            window.open('https://www.github.com', '_blank');
            return 'Opening GitHub for you.';
        } else if (lowerCommand.includes('close') && lowerCommand.includes('tab')) {
            window.close();
            return 'Attempting to close the current tab.';
        } else if (lowerCommand.includes('refresh')) {
            window.location.reload();
            return 'Refreshing the page.';
        } else if (lowerCommand.includes('new tab')) {
            window.open('about:blank', '_blank');
            return 'Opening a new tab.';
        } else {
            // Try to extract URL or search term
            const urlMatch = command.match(/open\s+(.*)/i);
            if (urlMatch) {
                const site = urlMatch[1].trim();
                let url = site;
                if (!site.startsWith('http')) {
                    url = site.includes('.') ? `https://${site}` : `https://www.google.com/search?q=${encodeURIComponent(site)}`;
                }
                window.open(url, '_blank');
                return `Opening ${site} for you.`;
            }
            return 'Browser command not recognized. Try "open Google" or "open YouTube".';
        }
    }
}

class SearchAgent {
    async execute(command) {
        const lowerCommand = command.toLowerCase();
        let searchTerm = '';
        
        if (lowerCommand.includes('search for')) {
            searchTerm = command.replace(/search for/i, '').trim();
        } else if (lowerCommand.includes('google')) {
            searchTerm = command.replace(/google/i, '').trim();
        } else if (lowerCommand.includes('look up')) {
            searchTerm = command.replace(/look up/i, '').trim();
        } else if (lowerCommand.includes('find')) {
            searchTerm = command.replace(/find/i, '').trim();
        } else if (lowerCommand.startsWith('what is')) {
            searchTerm = command.replace(/what is/i, '').trim();
        } else if (lowerCommand.startsWith('who is')) {
            searchTerm = command.replace(/who is/i, '').trim();
        } else if (lowerCommand.startsWith('how to')) {
            searchTerm = command;
        } else {
            searchTerm = command;
        }
        
        if (searchTerm) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
            window.open(searchUrl, '_blank');
            return `Searching for "${searchTerm}" on Google.`;
        } else {
            return 'Please specify what you want to search for.';
        }
    }
}

class SystemAgent {
    async execute(command) {
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('time')) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            return `The current time is ${timeString}.`;
        } else if (lowerCommand.includes('date')) {
            const now = new Date();
            const dateString = now.toLocaleDateString();
            return `Today's date is ${dateString}.`;
        } else if (lowerCommand.includes('calculator')) {
            window.open('https://www.google.com/search?q=calculator', '_blank');
            return 'Opening calculator for you.';
        } else if (lowerCommand.includes('weather')) {
            window.open('https://www.google.com/search?q=weather', '_blank');
            return 'Opening weather information for you.';
        } else if (lowerCommand.includes('ip address')) {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                return `Your IP address is ${data.ip}.`;
            } catch (error) {
                return 'Unable to retrieve IP address at the moment.';
            }
        } else {
            return 'System command not recognized. Try asking for time, date, or weather.';
        }
    }
}

class TaskAgent {
    async execute(command) {
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
            return 'Hello! How can I assist you today?';
        } else if (lowerCommand.includes('help')) {
            return 'I can help you with browser tasks, searches, system information, and more. Try saying "open Google", "search for cats", or "what time is it".';
        } else if (lowerCommand.includes('thank you')) {
            return 'You\'re welcome! Is there anything else I can help you with?';
        } else if (lowerCommand.includes('goodbye') || lowerCommand.includes('bye')) {
            return 'Goodbye! Have a great day!';
        } else {
            return `I heard you say: "${command}". I'm not sure how to handle that specific request, but I'm learning! Try browser commands, searches, or system queries.`;
        }
    }
}

// Quick command function
function executeQuickCommand(command) {
    if (window.assistant) {
        window.assistant.processCommand(command);
    }
}

// Initialize the voice assistant
window.addEventListener('load', () => {
    window.assistant = new VoiceAssistant();
});
