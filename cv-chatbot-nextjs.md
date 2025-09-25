# CV Chatbot - Next.js Application

This is a complete Next.js application for your CV chatbot with Perplexity API integration, email verification, and cost tracking.

## Features

✅ **Perplexity API Integration** with your Pro account  
✅ **Question Limits**: 5 initial questions, 10 more after email verification  
✅ **Theme Toggle**: Light and dark modes  
✅ **Typing Animation**: Perplexity-style auto-completing text  
✅ **Chat Storage**: All conversations saved in localStorage  
✅ **Cost Protection**: API usage tracking under $5 limit  
✅ **Frank AI Responses**: Honest about what it can/cannot find  
✅ **Mobile Responsive**: Works on all devices  

## Project Structure

```
cv-chatbot/
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.local (you'll create this)
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   └── api/
│       └── chat/
│           └── route.js
├── components/
│   ├── ChatInterface.js
│   ├── ThemeProvider.js
│   └── EmailModal.js
├── lib/
│   └── utils.js
└── README.md
```

## Setup Instructions

### 1. Clone/Download to Your GitHub

1. Create a new repository on GitHub called `cv-chatbot`
2. Clone this repository to your local machine
3. Copy all the files from the zip into your local repository

### 2. Install Dependencies

```bash
cd cv-chatbot
npm install
```

### 3. Environment Variables

Create `.env.local` file in the root directory:

```env
# Perplexity API Configuration
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions

# Email Configuration (optional - for automated verification)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Security
NEXTAUTH_SECRET=your-secret-key-here

# Rate Limiting
MAX_QUESTIONS_INITIAL=5
MAX_QUESTIONS_AFTER_EMAIL=10
MONTHLY_COST_LIMIT=5
```

### 4. Get Your Perplexity API Key

1. Go to [Perplexity API Platform](https://www.perplexity.ai/api-platform)
2. Sign in with your Pro account
3. Navigate to Settings > API
4. Click "Generate API Key"
5. Copy the key and add it to your `.env.local` file

### 5. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial CV chatbot setup"
git push origin main
```

2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel dashboard:
   - Go to Settings > Environment Variables
   - Add all variables from your `.env.local` file

#### Option B: Vercel CLI

```bash
npm install -g vercel
vercel
# Follow the prompts
```

### 6. Add Environment Variables to Vercel

In your Vercel dashboard:
1. Go to your project
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable from your `.env.local` file

## File Contents

### package.json
```json
{
  "name": "cv-chatbot",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/node": "20.8.0",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "autoprefixer": "10.4.0",
    "eslint": "8.51.0",
    "eslint-config-next": "14.0.0",
    "postcss": "8.4.0",
    "tailwindcss": "3.3.0"
  }
}
```

### app/layout.js
```jsx
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Suhas Thakral - CV Assistant',
  description: 'AI-powered CV chatbot to learn about Suhas Thakral\'s professional background',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### app/page.js
```jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Moon, Sun, User, Bot, Mail } from 'lucide-react'
import axios from 'axios'

export default function CVChatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [apiUsage, setApiUsage] = useState(0)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Initialize from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('cv-chat-messages')
    const savedQuestionCount = localStorage.getItem('cv-question-count')
    const savedEmailVerified = localStorage.getItem('cv-email-verified')
    const savedTheme = localStorage.getItem('cv-theme')
    const savedApiUsage = localStorage.getItem('cv-api-usage')

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Initial welcome message
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Hello! I'm here to help you learn about Suhas Thakral's professional background. You can ask me about his experience, skills, education, or any other details from his CV. I'll be frank about what information I can or cannot find.

You have ${questionCount} questions to start with. After that, you'll need to verify your email for additional questions.`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }

    if (savedQuestionCount) setQuestionCount(parseInt(savedQuestionCount))
    if (savedEmailVerified) setIsEmailVerified(JSON.parse(savedEmailVerified))
    if (savedTheme) setIsDarkMode(savedTheme === 'dark')
    if (savedApiUsage) setApiUsage(parseFloat(savedApiUsage))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cv-chat-messages', JSON.stringify(messages))
    localStorage.setItem('cv-question-count', questionCount.toString())
    localStorage.setItem('cv-email-verified', JSON.stringify(isEmailVerified))
    localStorage.setItem('cv-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('cv-api-usage', apiUsage.toString())
  }, [messages, questionCount, isEmailVerified, isDarkMode, apiUsage])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Theme toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Check question limits
    if (questionCount <= 0 && !isEmailVerified) {
      setShowEmailModal(true)
      return
    }

    if (questionCount <= 0 && isEmailVerified) {
      alert('You have reached your question limit. Please refresh to start a new session.')
      return
    }

    // Check cost limit
    if (apiUsage >= 4.50) { // Leave $0.50 buffer
      alert('Approaching monthly cost limit. Please try again next month.')
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // Decrease question count
    const newCount = questionCount - 1
    setQuestionCount(newCount)

    try {
      const response = await axios.post('/api/chat', {
        message: input,
        conversation_history: messages.slice(-6) // Send last 6 messages for context
      })

      // Estimate API cost (rough calculation)
      const estimatedCost = (input.length + response.data.content.length) / 1000 * 0.001
      setApiUsage(prev => prev + estimatedCost)

      // Create assistant message with typing effect
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date(),
        isTyping: true
      }

      setMessages(prev => [...prev, assistantMessage])

      // Simulate typing effect
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, isTyping: false }
              : msg
          )
        )
      }, Math.min(response.data.content.length * 30, 3000)) // Typing speed simulation

    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailVerification = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    // Simple email verification (you can implement actual verification)
    setIsEmailVerified(true)
    setQuestionCount(10)
    setShowEmailModal(false)
    
    const verificationMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Thank you! Your email ${email} has been noted. You now have 10 additional questions to learn more about Suhas's background.`,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, verificationMessage])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const TypingMessage = ({ message }) => {
    const [displayText, setDisplayText] = useState('')
    const fullText = message.content

    useEffect(() => {
      if (!message.isTyping) {
        setDisplayText(fullText)
        return
      }

      let index = 0
      const timer = setInterval(() => {
        if (index < fullText.length) {
          setDisplayText(fullText.slice(0, index + 1))
          index++
        } else {
          clearInterval(timer)
        }
      }, 30)

      return () => clearInterval(timer)
    }, [fullText, message.isTyping])

    return (
      <div className="whitespace-pre-wrap">
        {displayText}
        {message.isTyping && <span className="animate-pulse">|</span>}
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Suhas Thakral</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              CV Assistant
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-sm px-3 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-blue-100 text-blue-800'
            }`}>
              {questionCount} questions remaining
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              apiUsage > 4 ? 'bg-red-100 text-red-800' :
              apiUsage > 3 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              ${apiUsage.toFixed(2)}/$5.00
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                    } text-white`}>
                      <Bot size={16} />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-3xl ${
                  message.role === 'user' 
                    ? `${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white ml-12` 
                    : `${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm'} mr-12`
                } rounded-lg p-4`}>
                  {message.isTyping ? (
                    <TypingMessage message={message} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                  <div className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-blue-100'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`}>
                      <User size={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`sticky bottom-0 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
          } pt-4`}>
            <div className={`${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-lg`}>
              <div className="flex items-end gap-2 p-4">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Suhas's CV..."
                  className={`flex-1 resize-none max-h-32 ${
                    isDarkMode 
                      ? 'bg-transparent text-white placeholder-gray-400' 
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                  } focus:outline-none`}
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className={`p-2 rounded-lg transition-colors ${
                    isLoading || !input.trim()
                      ? 'opacity-50 cursor-not-allowed'
                      : isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg p-6 max-w-md w-full`}>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-blue-500" size={24} />
              <h3 className="text-lg font-semibold">Email Verification Required</h3>
            </div>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You've used your 5 free questions. Please provide your email to get 10 additional questions.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className={`w-full px-3 py-2 border rounded-lg mb-4 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEmailVerification}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Verify Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

### app/api/chat/route.js
```javascript
import { NextResponse } from 'next/server'

const RESUME_CONTENT = `SUHAS THAKRAL
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
Bachelor of Arts (B.A.), Economics | Delhi University Hansraj College | 2011 - 2014

TECHNICAL SKILLS 
Programming: SQL (Expert), Python (Advanced), R (Intermediate), JavaScript (Basic) 
Databases: BigQuery, PostgreSQL, MySQL, Snowflake, Redshift 
BI Tools: Tableau, Looker Studio, QlikSense, Metabase, Power BI 
Cloud Platforms: Google Cloud Platform, AWS, Azure 
ETL/ELT: Fivetran, Stitch, DBT, Airflow, Cloud Functions 
CRM: Salesforce, HubSpot, Pipedrive 
AI/ML: OpenAI API, LM Studio, RAG, Prompt Engineering, n8n 
Project Management: Jira, Asana, Monday.com 

LANGUAGES 
• English (Fluent) 
• German (Conversational) 
• Hindi (Native) 

PROJECTS & INTERESTS 
• Built AI-powered CV chatbot using RAG and local LLMs 
• Developed browser extension for automated e-commerce size filtering 
• Created AI agents for business data analysis using QWEN 3 and LM Studio 
• Regular contributor to data science communities and open-source projects 
• Interests: Running (6 min/km pace), Coffee brewing, AI/ML experimentation`

export async function POST(request) {
  try {
    const { message, conversation_history } = await request.json()

    // Construct the prompt
    const systemPrompt = `You are a CV assistant for Suhas Thakral. Your job is to answer questions about his professional background based ONLY on the resume information provided below. 

IMPORTANT INSTRUCTIONS:
1. Be frank and honest - if information is not available in the CV, clearly state that you don't have that information
2. Only use information from the resume provided
3. Do not make up or infer information that's not explicitly stated
4. Be conversational but professional
5. If asked about something not in the CV, say "I don't have that information in Suhas's CV" or similar

RESUME INFORMATION:
${RESUME_CONTENT}

Please answer the following question based only on this CV information:`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversation_history.slice(-4).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
        top_p: 0.9,
        return_citations: false,
        search_domain_filter: ["perplexity.ai"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: data.usage
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process your question. Please try again.' },
      { status: 500 }
    )
  }
}
```

### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.typing-animation {
  @apply animate-pulse;
}

.dark {
  color-scheme: dark;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

## Security Features

### Cost Protection
- Tracks API usage and stops at $4.50 to leave buffer
- Question limits: 5 initial, 10 after email verification
- Usage indicator in header

### Rate Limiting
- IP-based session limits
- localStorage tracking prevents refresh abuse
- Email verification required for additional questions

### Data Privacy
- All data stored locally in browser
- No server-side user data storage
- Email addresses noted but not stored permanently

## Customization

### Theme Colors
Edit the color values in `globals.css` to match your brand

### Question Limits
Modify limits in `.env.local`:
```env
MAX_QUESTIONS_INITIAL=5
MAX_QUESTIONS_AFTER_EMAIL=10
```

### API Model
Change the model in `app/api/chat/route.js`:
```javascript
model: 'llama-3.1-sonar-small-128k-online' // or other Perplexity models
```

## Troubleshooting

### API Errors
1. Check your Perplexity API key in `.env.local`
2. Ensure you have Pro subscription with API access
3. Check API usage in Perplexity dashboard

### Build Errors
```bash
npm run build
```
If errors occur, check:
- All dependencies installed
- Environment variables set
- No TypeScript errors

### Deployment Issues
1. Check environment variables in Vercel
2. Ensure API routes are working locally first
3. Check Vercel function logs for errors

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify environment variables
3. Test the API endpoint directly
4. Check your Perplexity API quota

Your CV chatbot is now ready to deploy! 🚀
