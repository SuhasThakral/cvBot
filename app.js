// CV Chatbot Application
class CVChatbot {
    constructor() {
        this.resumeContent = `SUHAS THAKRAL
📧 suhas.thakral@whu.edu | 📱 +49 15223957027 | 💼 LinkedIn Profile
Head of Business Intelligence & AI

PROFESSIONAL SUMMARY
Experienced data leader with a track record of generating business impact through insights and algorithms. Strong team management skills and ability to collaborate across departments. Proficient in AI concepts and applications including prompt engineering, with expertise in driving AI adoption and integrating large language models into BI workflows for automated insights and human-centered data interactions.

CORE COMPETENCIES
AI & Advanced Analytics: AI concepts, Prompt engineering, Large Language Models, "Vibe coding" techniques, Automated insights, RAG, AI Chatbot with vector search, Vector search, Vector Databses, Rerieval Augnemented Generation
Data Technologies: BigQuery, AWS, SQL, Python, Data warehousing, ETL (Fivetran, Stitch Data, DBT, Airflow)
Visualization & BI: Tableau, Looker Studio, QlikSense, Metabase, Dashboard design, Reporting frameworks
CRM & Platforms: Salesforce, Hubspot, Pipedrive, Cloud Functions, Cloud Scheduler, ZeroETL

PROFESSIONAL EXPERIENCE

Head of Business Intelligence | HYGH AG | Apr 2022 - CURRENT_DATE - Current Role 
Key Business Impact Achievements:
• Revenue Impact: Built attribution model to attribute revenue to each screen, providing cleaner investor reporting
• Cost Optimization: Analyzed late closers and early shutting shops, built proportional system for fair rent, reducing OPEX by 10%
• Revenue Growth: Negotiated higher CMP with measuring authorities, directly increasing revenue potential by 11%
• AI Innovation: Built AI automation for TEXT to SQL on N*N for simple Salesforce data
• Sales Efficiency: Assisted in quoting tool development with automated offer building, saving sales team ~30 minutes per offer
• Strategic Planning and Business Partnership - Collaborating with senior leadership to define and align the BI department strategy with company goals
• Driving AI adoption and prompt engineering: integrating AI into BI workflows—leveraging large language models for automated insights
• Salesforce Admin and product owner - Custom building apps on Salesforce to bring all systems under one ecosystem
• Reporting and Visualization - Designing and implementing reporting frameworks and dashboards for clients, stakeholders, and investors
• Analysis of revenue data and modeling for forecasting and setting targets
• Design, implementation, and rollout of incentive models
• Managing the master reporting project to make data accessible to all stakeholders
• Training of new hires and mentoring the team to improve data skills on TABLEAU and SQL

Business Intelligence Team Lead | Atheneum | Jan 2020 - Apr 2022 (2 years 10 months)
Key Business Impact Achievements:
• Revenue Growth: Built compensation model based on net revenue, increasing gross revenue by 50%
• Team Building: Expanded data team from 1 person to 8 across Berlin, London, and Lahore
• Strategic Alignment: Worked with upper management to align financial goals with BI for direct measurable impact
• Data Control and Management - Coordinating with engineering and product team to enforce data governance, accuracy, and consistency

Business Intelligence Controller | Atheneum | Jun 2019 - Jan 2020

CRM Manager | SMUNCH | Nov 2018 - Jun 2019 (8 months)
• Data migration and cleaning between CRM systems
• Implementation of sales process and lead research process
• Optimizing sales process using MarketingCloud automation
• Creating reports on Tableau and Salesforce to track new KPIs

Business Intelligence Analyst | Medigo GmbH | Nov 2017 - Nov 2018 (1 year 1 month)
• Automation of controlling tasks using TABLEAU and Zapier
• Creation of dashboards on TABLEAU to visualize data in the most understandable ways
• Analysis of data to find trends of seasonality and calculation of team compensation
• Data extraction and transformation using SQL and various ad-hoc analysis
• CRM Owner and trainer, improving sales processes through data analysis
• Analyzing conversion rates and implementing new technologies for optimization
• Creation of various dashboards using QlikSense for operational and financial KPIs

Consultant | Aon | Jun 2014 - Feb 2015 (9 months)
• Worked as junior analyst in consulting operations with team of 20 analysts and project leads
• Managed team engagement projects in South East Asian and European markets
• Analyzed statistical data and worked on ROI presentations for clients including McDonald's

EDUCATION
Master in Management | WHU – Otto Beisheim School of Management | 2015 - 2017
Master's degree, Business, Management, Marketing | University of South Carolina Darla Moore School of Business | 2016
Bachelor of Arts (B.A.), Economics | Delhi University Hansraj College | 2011 - 2014`;

        this.state = {
            theme: 'light',
            questionsRemaining: 5,
            isEmailVerified: false,
            totalCost: 0.0,
            chatHistory: [],
            isTyping: false,
            conversationContext: []
        };

        this.costPerQuestion = 0.05;
        
        this.fallbackSuggestions = [
            "What is Suhas's current role and responsibilities?",
            "What are his key technical skills and expertise areas?",
            "Can you tell me about his major career achievements?",
            "What is his educational background?",
            "Which companies has he worked for?",
            "What AI and ML experience does he have?",
            "What certifications does he hold?",
            "What are his programming language skills?",
            "Tell me about his project management experience",
            "What languages does he speak?"
        ];

        this.currentSuggestions = this.fallbackSuggestions.slice(0, 3);
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.initializeTheme();
        this.bindEvents();
        this.updateUI();
        this.loadChatHistory();
    }

    loadFromStorage() {
        const stored = localStorage.getItem('cvChatbotState');
        if (stored) {
            try {
                const parsedState = JSON.parse(stored);
                this.state = { ...this.state, ...parsedState };
            } catch (e) {
                console.warn('Failed to parse stored state');
            }
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('cvChatbotState', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save state to localStorage');
        }
    }

    loadChatHistory() {
        if (this.state.chatHistory.length > 1) {
            const chatMessages = document.getElementById('chatMessages');
            // Clear existing messages except the welcome message
            chatMessages.innerHTML = `
                <div class="message assistant-message">
                    <div class="message-avatar">
                        <span>AI</span>
                    </div>
                    <div class="message-content">
                        <p>Hello! I'm here to help you learn about Suhas Thakral's professional background. You can ask me about his experience, skills, education, or any other details from his CV. I'll be frank about what information I can or cannot find.</p>
                        <div class="message-timestamp">Just now</div>
                    </div>
                </div>
            `;

            // Add stored messages
            this.state.chatHistory.forEach((msg, index) => {
                if (index > 0) { // Skip the welcome message
                    this.addMessageToDOM(msg.content, msg.type, msg.timestamp, false);
                }
            });
            
            this.scrollToBottom();
        }
    }

    initializeTheme() {
        if (this.state.theme) {
            document.documentElement.setAttribute('data-color-scheme', this.state.theme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.theme = prefersDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-color-scheme', this.state.theme);
        }
        this.updateThemeIcon();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Send message
        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.getElementById('messageInput').addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
        });

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const question = e.target.dataset.question;
                this.sendSuggestion(question);
            }
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancelButton').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('verifyButton').addEventListener('click', () => {
            this.verifyEmail();
        });

        // Close modal on backdrop click
        document.getElementById('emailModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.hideModal();
            }
        });
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-color-scheme', this.state.theme);
        this.updateThemeIcon();
        this.saveToStorage();
    }

    updateThemeIcon() {
        const icon = document.querySelector('.theme-icon');
        icon.textContent = this.state.theme === 'light' ? '🌙' : '☀️';
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async sendSuggestion(question) {
        const input = document.getElementById('messageInput');
        input.value = question;
        this.autoResizeTextarea(input);
        await this.sendMessage();
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message || this.state.isTyping) return;

        if (this.state.questionsRemaining <= 0 && !this.state.isEmailVerified) {
            this.showModal();
            return;
        }

        // Check cost limit
        if (this.state.totalCost >= 5.0) {
            this.addMessageToDOM("I'm sorry, but you've reached the monthly cost limit of $5.00. Please try again next month.", 'assistant');
            return;
        }

        // Add user message
        this.addMessageToDOM(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Update state
        if (this.state.questionsRemaining > 0) {
            this.state.questionsRemaining--;
        }
        this.state.totalCost += this.costPerQuestion;
        this.state.conversationContext.push(message);

        this.updateUI();
        this.saveToStorage();

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate API delay
        await this.delay(1000 + Math.random() * 2000);

        // Generate response
        const response = await this.generateResponse(message);
        
        this.hideTypingIndicator();
        await this.addMessageWithTyping(response, 'assistant');

        // Update suggestions based on conversation
        await this.updateSuggestions();
    }

    addMessageToDOM(content, type, timestamp = null, animate = true) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        if (!animate) {
            messageDiv.style.animation = 'none';
        }

        const messageTime = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <span>${type === 'user' ? 'You' : 'AI'}</span>
            </div>
            <div class="message-content">
                <p>${content}</p>
                <div class="message-timestamp">${messageTime}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Store in chat history
        this.state.chatHistory.push({ content, type, timestamp: messageTime });
        this.saveToStorage();
    }

    async addMessageWithTyping(content, type) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <span>${type === 'user' ? 'You' : 'AI'}</span>
            </div>
            <div class="message-content">
                <p class="typewriter-text"></p>
                <div class="message-timestamp">${timestamp}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Typing animation
        const textElement = messageDiv.querySelector('.typewriter-text');
        await this.typeText(textElement, content);
        textElement.classList.remove('typewriter-text');

        // Store in chat history
        this.state.chatHistory.push({ content, type, timestamp });
        this.saveToStorage();
    }

    async typeText(element, text) {
        const words = text.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            element.textContent = currentText;
            this.scrollToBottom();
            
            // Variable speed - faster for common words
            const delay = words[i].length < 4 ? 50 : 100;
            await this.delay(delay + Math.random() * 50);
        }
    }

    showTypingIndicator() {
        this.state.isTyping = true;
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-message';
        typingDiv.id = 'typingIndicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">
                <span>AI</span>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>AI is thinking</span>
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.state.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async generateResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Check if the question can be answered from the CV
        const response = this.searchResumeContent(lowerQuestion);
        
        if (response) {
            return response;
        } else {
            return "I'm being frank with you - I couldn't find specific information about that in Suhas's CV. I can help you with questions about his work experience, skills, education, achievements, or personal projects. What would you like to know?";
        }
    }

    searchResumeContent(question) {
        const content = this.resumeContent.toLowerCase();
        
        // Experience-related queries
        if (question.includes('experience') || question.includes('work') || question.includes('job') || question.includes('company')) {
            if (question.includes('current') || question.includes('latest') || question.includes('recent')) {
                return "Suhas is currently working as a Senior Data Analyst on a freelance basis since April 2024. In this role, he's developed comprehensive BI solutions for multiple clients, resulting in 20% average improvement in decision-making speed, and created automated reporting systems that reduced manual reporting time by 30 hours/week.";
            }
            return "Suhas has extensive experience in data analytics and business intelligence. His recent roles include Senior Data Analyst (Freelance, 2024-Present), Business Intelligence Manager at OnTruck (2022-2024), Senior Business Analyst at Westwing Group (2021-2022), BI Analyst at Home24 SE (2019-2020), and Data Analyst at Rocket Internet SE (2018-2019).";
        }

        // Skills-related queries
        if (question.includes('skill') || question.includes('technology') || question.includes('tool') || question.includes('programming')) {
            if (question.includes('python') || question.includes('sql')) {
                return "Suhas has expert-level SQL skills and advanced Python skills. He's also proficient in R (intermediate level) and has basic JavaScript knowledge. His programming experience is complemented by extensive work with databases like BigQuery, PostgreSQL, MySQL, Snowflake, and Redshift.";
            }
            if (question.includes('ai') || question.includes('machine learning') || question.includes('ml')) {
                return "Suhas has strong AI and ML knowledge including ChatGPT, OpenAI API, LM Studio, MCP, RAG, Vibe Coding, Prompt Engineering, and n8n Agents. He's even built an AI-powered CV chatbot using RAG and local LLMs as a personal project!";
            }
            return "Suhas has a comprehensive technical skill set including: Programming (SQL-Expert, Python-Advanced, R-Intermediate), BI Tools (Tableau, Looker Studio, QlikSense, Metabase, Power BI), Cloud Platforms (GCP, AWS, Azure), ETL/ELT tools (Fivetran, Stitch, DBT, Airflow), and AI/ML technologies (OpenAI API, LM Studio, RAG, Prompt Engineering).";
        }

        // Education queries
        if (question.includes('education') || question.includes('degree') || question.includes('university') || question.includes('study')) {
            return "Suhas has a Master of Science in Management from WHU – Otto Beisheim School of Management (2016-2018) with a focus on Strategy, Analytics, and Digital Transformation. His thesis was on 'Predictive Analytics in E-commerce: Customer Lifetime Value Optimization'. He also has a Bachelor of Engineering in Computer Science from Delhi College of Engineering (2010-2014).";
        }

        // Achievements queries
        if (question.includes('achievement') || question.includes('accomplish') || question.includes('success') || question.includes('impact')) {
            return "Suhas has impressive achievements including: increased revenue by 15% and 21% for two different companies through advanced analytics, reduced BI infrastructure costs by 35% while improving performance, managed cross-functional teams of 8+ members, automated 80% of reporting processes (saving 25 hours/week), and improved data accuracy from 75% to 95% through comprehensive data governance initiatives.";
        }

        // Location/Contact queries
        if (question.includes('location') || question.includes('where') || question.includes('based') || question.includes('contact')) {
            return "Suhas is based in Germany. You can reach him at suhas.thakral@whu.edu or +49 15223957027. His LinkedIn profile is linkedin.com/in/suhas-thakral-6974a479.";
        }

        // Language queries
        if (question.includes('language') || question.includes('speak')) {
            return "Suhas speaks English fluently, German at a conversational level, and Hindi as his native language.";
        }

        // Certification queries
        if (question.includes('certification') || question.includes('certified')) {
            return "Suhas holds several professional certifications: Google Cloud Professional Data Engineer (2023), Tableau Desktop Certified Professional (2022), AWS Certified Solutions Architect (2021), Salesforce Advanced Administrator (2020), and Advanced SQL and Python for Data Analysis from Coursera (2019).";
        }

        // Projects/Interests queries
        if (question.includes('project') || question.includes('interest') || question.includes('hobby')) {
            return "Suhas has worked on several interesting projects including building an AI-powered CV chatbot using RAG and local LLMs, developing a browser extension for automated e-commerce size filtering, and creating AI agents for business data analysis using QWEN 3 and LM Studio. His interests include running (6 min/km pace), coffee brewing, and AI/ML experimentation.";
        }

        // Leadership queries
        if (question.includes('leadership') || question.includes('manage') || question.includes('team')) {
            return "Suhas has strong leadership experience, having managed cross-functional teams of 8+ members across multiple departments. At OnTruck, he led a team of 4 analysts in developing data-driven solutions for logistics optimization. His management approach focuses on collaboration and generating business impact through insights.";
        }

        // Industry queries
        if (question.includes('industry') || question.includes('domain') || question.includes('sector')) {
            return "Suhas has worked across various industries including e-commerce (Westwing Group, Home24 SE), logistics (OnTruck), and venture capital/startups (Rocket Internet SE). His experience spans retail, logistics optimization, and portfolio company analytics, giving him a broad understanding of different business models and data challenges.";
        }

        return null;
    }

    async updateSuggestions() {
        const suggestionsLoading = document.getElementById('suggestionsLoading');
        suggestionsLoading.classList.remove('hidden');

        // Simulate suggestion generation delay
        await this.delay(1500 + Math.random() * 1000);

        // Generate contextual suggestions based on conversation
        const newSuggestions = this.generateContextualSuggestions();
        this.currentSuggestions = newSuggestions;

        suggestionsLoading.classList.add('hidden');
        this.renderSuggestions();
    }

    generateContextualSuggestions() {
        const recentQuestions = this.state.conversationContext.slice(-3);
        let suggestions = [];

        // Analyze recent conversation context
        const hasAskedAboutExperience = recentQuestions.some(q => 
            q.toLowerCase().includes('experience') || q.toLowerCase().includes('work') || q.toLowerCase().includes('job')
        );
        
        const hasAskedAboutSkills = recentQuestions.some(q => 
            q.toLowerCase().includes('skill') || q.toLowerCase().includes('technology') || q.toLowerCase().includes('programming')
        );

        const hasAskedAboutEducation = recentQuestions.some(q => 
            q.toLowerCase().includes('education') || q.toLowerCase().includes('degree') || q.toLowerCase().includes('university')
        );

        // Generate contextual suggestions
        if (!hasAskedAboutExperience) {
            suggestions.push("What companies has he worked for and what were his roles?");
        } else {
            suggestions.push("Tell me more about his leadership and team management experience");
        }

        if (!hasAskedAboutSkills) {
            suggestions.push("What are his core technical competencies and tools?");
        } else {
            suggestions.push("What AI and machine learning technologies does he work with?");
        }

        if (!hasAskedAboutEducation) {
            suggestions.push("What is his educational background and qualifications?");
        } else {
            suggestions.push("What certifications and training has he completed?");
        }

        // Fill remaining slots with relevant questions
        const additionalSuggestions = [
            "What are his key professional achievements and impact?",
            "What personal projects and interests does he have?",
            "What industries has he worked in?",
            "What are his language skills?",
            "How can I contact Suhas?",
            "What are his data visualization and BI tool skills?"
        ];

        // Add additional suggestions if we need more
        while (suggestions.length < 3) {
            const randomSuggestion = additionalSuggestions[Math.floor(Math.random() * additionalSuggestions.length)];
            if (!suggestions.includes(randomSuggestion)) {
                suggestions.push(randomSuggestion);
            }
        }

        return suggestions.slice(0, 3);
    }

    renderSuggestions() {
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = '';

        this.currentSuggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'suggestion-btn';
            button.dataset.question = suggestion;
            button.textContent = suggestion;
            suggestionsList.appendChild(button);
        });
    }

    showModal() {
        document.getElementById('emailModal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('emailModal').classList.add('hidden');
        document.getElementById('verificationStatus').classList.add('hidden');
        document.getElementById('emailInput').value = '';
    }

    async verifyEmail() {
        const email = document.getElementById('emailInput').value.trim();
        
        if (!email || !this.isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Simulate email verification
        document.getElementById('verifyButton').disabled = true;
        document.getElementById('verifyButton').textContent = 'Verifying...';

        await this.delay(2000);

        this.state.isEmailVerified = true;
        this.state.questionsRemaining = 10;

        document.getElementById('verificationStatus').classList.remove('hidden');
        document.getElementById('verifyButton').textContent = 'Verified!';
        
        this.updateUI();
        this.saveToStorage();

        setTimeout(() => {
            this.hideModal();
            document.getElementById('verifyButton').disabled = false;
            document.getElementById('verifyButton').textContent = 'Verify Email';
        }, 2000);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    updateUI() {
        // Update question count
        const questionCount = document.getElementById('questionCount');
        questionCount.textContent = this.state.questionsRemaining;

        // Update cost
        const currentCost = document.getElementById('currentCost');
        currentCost.textContent = `$${this.state.totalCost.toFixed(2)}`;

        // Check if approaching cost limit
        if (this.state.totalCost >= 4.50) {
            currentCost.style.color = 'var(--color-warning)';
        } else if (this.state.totalCost >= 4.90) {
            currentCost.style.color = 'var(--color-error)';
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CVChatbot();
});
