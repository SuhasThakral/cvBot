# Enhanced CV Chatbot with Smart Suggestions

## Updated app/page.js with Smart Suggestions

```jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Moon, Sun, User, Bot, Mail, Lightbulb } from 'lucide-react'
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
  const [suggestions, setSuggestions] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Initial suggestions based on CV content
  const initialSuggestions = [
    "What is Suhas's current role and experience level?",
    "What technical skills does Suhas have in data analytics?",
    "What are Suhas's key achievements in his career?"
  ]

  // Initialize from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('cv-chat-messages')
    const savedQuestionCount = localStorage.getItem('cv-question-count')
    const savedEmailVerified = localStorage.getItem('cv-email-verified')
    const savedTheme = localStorage.getItem('cv-theme')
    const savedApiUsage = localStorage.getItem('cv-api-usage')
    const savedSuggestions = localStorage.getItem('cv-suggestions')

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else {
      // Initial welcome message
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `Hello! I'm here to help you learn about Suhas Thakral's professional background. You can ask me about his experience, skills, education, or any other details from his CV. I'll be frank about what information I can or cannot find.

You have ${questionCount} questions to start with. After that, you'll need to verify your email for additional questions.

Feel free to use the suggested questions below or ask anything else!`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }

    if (savedQuestionCount) setQuestionCount(parseInt(savedQuestionCount))
    if (savedEmailVerified) setIsEmailVerified(JSON.parse(savedEmailVerified))
    if (savedTheme) setIsDarkMode(savedTheme === 'dark')
    if (savedApiUsage) setApiUsage(parseFloat(savedApiUsage))
    if (savedSuggestions) {
      setSuggestions(JSON.parse(savedSuggestions))
    } else {
      setSuggestions(initialSuggestions)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cv-chat-messages', JSON.stringify(messages))
    localStorage.setItem('cv-question-count', questionCount.toString())
    localStorage.setItem('cv-email-verified', JSON.stringify(isEmailVerified))
    localStorage.setItem('cv-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('cv-api-usage', apiUsage.toString())
    localStorage.setItem('cv-suggestions', JSON.stringify(suggestions))
  }, [messages, questionCount, isEmailVerified, isDarkMode, apiUsage, suggestions])

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

  // Generate contextual suggestions based on conversation
  const generateSuggestions = async (lastMessage) => {
    try {
      setIsLoadingSuggestions(true)
      const response = await axios.post('/api/suggestions', {
        lastMessage,
        conversationHistory: messages.slice(-4)
      })
      setSuggestions(response.data.suggestions)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      // Fallback to context-aware suggestions
      generateFallbackSuggestions(lastMessage)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Fallback suggestion generation based on keywords
  const generateFallbackSuggestions = (lastMessage) => {
    const content = lastMessage?.toLowerCase() || ''
    
    let contextSuggestions = []
    
    // Context-aware suggestions based on what was asked
    if (content.includes('experience') || content.includes('work') || content.includes('job')) {
      contextSuggestions = [
        "What was Suhas's role at OnTruck and what did he achieve?",
        "How long has Suhas been working in data analytics?",
        "What companies has Suhas worked for?"
      ]
    } else if (content.includes('skill') || content.includes('technical') || content.includes('tool')) {
      contextSuggestions = [
        "What programming languages does Suhas know?",
        "What BI tools has Suhas worked with?",
        "Does Suhas have cloud platform experience?"
      ]
    } else if (content.includes('education') || content.includes('degree') || content.includes('university')) {
      contextSuggestions = [
        "What certifications does Suhas have?",
        "Where did Suhas complete his Master's degree?",
        "What was Suhas's thesis topic?"
      ]
    } else if (content.includes('achievement') || content.includes('success') || content.includes('revenue')) {
      contextSuggestions = [
        "What cost optimizations has Suhas delivered?",
        "How much revenue growth did Suhas help generate?",
        "What process improvements has Suhas made?"
      ]
    } else if (content.includes('current') || content.includes('freelance') || content.includes('recent')) {
      contextSuggestions = [
        "What projects is Suhas working on currently?",
        "What AI technologies is Suhas experienced with?",
        "What interests does Suhas have outside work?"
      ]
    } else {
      // General follow-up suggestions
      const generalSuggestions = [
        "What leadership experience does Suhas have?",
        "What data visualization tools does Suhas use?",
        "How has Suhas improved data quality in his roles?",
        "What's Suhas's experience with machine learning?",
        "What languages does Suhas speak?",
        "What ETL tools has Suhas worked with?",
        "What's Suhas's educational background?",
        "What are Suhas's hobbies and interests?"
      ]
      contextSuggestions = generalSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3)
    }
    
    setSuggestions(contextSuggestions)
  }

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim()) return

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
    if (apiUsage >= 4.50) {
      alert('Approaching monthly cost limit. Please try again next month.')
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
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
        message: messageText,
        conversation_history: messages.slice(-6)
      })

      // Estimate API cost
      const estimatedCost = (messageText.length + response.data.content.length) / 1000 * 0.001
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

      // Generate new suggestions based on the conversation
      setTimeout(() => {
        generateSuggestions(assistantMessage)
      }, 1000)

      // Simulate typing effect
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, isTyping: false }
              : msg
          )
        )
      }, Math.min(response.data.content.length * 30, 3000))

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

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    // Auto-send the suggestion
    handleSendMessage(suggestion)
  }

  const handleEmailVerification = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

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

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className={`mb-4 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg p-4 shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className={`${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-500'
                }`} size={16} />
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {isLoadingSuggestions ? 'Generating suggestions...' : 'Suggested questions:'}
                </span>
              </div>
              <div className="grid gap-2">
                {isLoadingSuggestions ? (
                  <div className="grid gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-10 rounded-lg animate-pulse ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-650 hover:border-blue-500 text-gray-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-700'
                      } text-sm leading-relaxed`}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

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
                  placeholder="Ask me anything about Suhas's CV or choose a suggestion above..."
                  className={`flex-1 resize-none max-h-32 ${
                    isDarkMode 
                      ? 'bg-transparent text-white placeholder-gray-400' 
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                  } focus:outline-none`}
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
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

## New API Route for Suggestions

### app/api/suggestions/route.js

```javascript
import { NextResponse } from 'next/server'

const RESUME_CONTENT = `SUHAS THAKRAL
📧 suhas.thakral@whu.edu | 📱 +49 15223957027 | 💼 LinkedIn Profile
Head of Business Intelligence & AI

PROFESSIONAL SUMMARY
Experienced data leader with a track record of generating business impact through insights and algorithms. Strong team management skills and ability to collaborate across departments. Proficient in AI concepts and applications including prompt engineering, with expertise in driving AI adoption and integrating large language models into BI workflows for automated insights and human-centered data interactions.

CORE COMPETENCIES
AI & Advanced Analytics: AI concepts, Prompt engineering, Large Language Models, "Vibe coding" techniques, Automated insights
Data Technologies: BigQuery, AWS, SQL, Python, Data warehousing, ETL (Fivetran, Stitch Data, DBT, Airflow)
Visualization & BI: Tableau, Looker Studio, QlikSense, Metabase, Dashboard design, Reporting frameworks
CRM & Platforms: Salesforce, Hubspot, Pipedrive, Cloud Functions, Cloud Scheduler, ZeroETL

PROFESSIONAL EXPERIENCE

Head of Business Intelligence | HYGH AG | Apr 2022 - CURRENT DATE . CURRENT ROLE IS Head of Business Intelligence AT| HYGH A
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
Bachelor of Arts (B.A.), Economics | Delhi University Hansraj College | 2011 - 2014`
export async function POST(request) {
  try {
    const { lastMessage, conversationHistory } = await request.json()
    
    // Create context from conversation
    const conversationContext = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')
    
    const systemPrompt = `You are a suggestion generator for Suhas Thakral's CV chatbot. Based on the conversation context and the last AI response, generate exactly 3 relevant follow-up questions that users might want to ask about Suhas's professional background.

RULES:
1. Generate exactly 3 questions
2. Make them specific and relevant to what was just discussed
3. Each question should be conversational and natural
4. Focus on different aspects of Suhas's background
5. Avoid repeating questions that were already asked
6. Keep questions under 15 words each
7. Return only a JSON array of the 3 questions

RESUME CONTEXT:
${RESUME_CONTENT}

CONVERSATION CONTEXT:
${conversationContext}

LAST AI RESPONSE:
${lastMessage?.content || ''}

Generate 3 contextual follow-up questions as a JSON array:`

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
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        return_citations: false,
        return_images: false,
        return_related_questions: false,
        stream: false,
        presence_penalty: 0.1,
        frequency_penalty: 0.2
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    let suggestions = []
    
    try {
      // Try to parse the JSON response
      const content = data.choices[0].message.content.trim()
      // Extract JSON from the response
      const jsonMatch = content.match(/\[.*\]/s)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON array found')
      }
    } catch (parseError) {
      // Fallback suggestions if parsing fails
      suggestions = generateFallbackSuggestions(lastMessage?.content || '')
    }
    
    // Ensure we have exactly 3 suggestions
    if (suggestions.length !== 3) {
      suggestions = suggestions.slice(0, 3)
      while (suggestions.length < 3) {
        suggestions.push("What other aspects of Suhas's background interest you?")
      }
    }
    
    return NextResponse.json({
      suggestions: suggestions
    })

  } catch (error) {
    console.error('Suggestions API Error:', error)
    
    // Return fallback suggestions
    const fallbackSuggestions = [
      "What technical skills does Suhas specialize in?",
      "What are Suhas's key career achievements?",
      "What is Suhas's educational background?"
    ]
    
    return NextResponse.json({
      suggestions: fallbackSuggestions
    })
  }
}

// Fallback suggestion generator
function generateFallbackSuggestions(lastResponse) {
  const response = lastResponse?.toLowerCase() || ''
  
  if (response.includes('experience') || response.includes('work')) {
    return [
      "What was Suhas's most challenging project?",
      "Which company did Suhas work for the longest?",
      "What leadership roles has Suhas held?"
    ]
  } else if (response.includes('skill') || response.includes('technical')) {
    return [
      "What programming languages does Suhas know?",
      "What cloud platforms has Suhas worked with?",
      "What BI tools is Suhas proficient in?"
    ]
  } else if (response.includes('education') || response.includes('degree')) {
    return [
      "What certifications does Suhas have?",
      "What was Suhas's thesis about?",
      "Where did Suhas complete his Bachelor's degree?"
    ]
  } else if (response.includes('achievement') || response.includes('revenue')) {
    return [
      "How much cost savings did Suhas deliver?",
      "What process improvements has Suhas made?",
      "What team management experience does Suhas have?"
    ]
  } else {
    return [
      "What is Suhas currently working on?",
      "What languages does Suhas speak?",
      "What are Suhas's hobbies and interests?"
    ]
  }
}
```

## Key Features Added:

✅ **Smart Suggestions**: 3 contextual questions appear below chat  
✅ **Dynamic Updates**: Suggestions change based on conversation context  
✅ **Fallback System**: Works even if API fails  
✅ **Visual Polish**: Nice UI with lightbulb icon and hover effects  
✅ **Cost Efficient**: Uses smaller model for suggestion generation  
✅ **Contextual Intelligence**: Analyzes conversation to suggest relevant follow-ups  

## How It Works:

1. **Initial Suggestions**: Shows 3 general questions when chat starts
2. **Context Analysis**: After each AI response, analyzes conversation
3. **Smart Generation**: Uses Perplexity API to generate contextual follow-ups
4. **Fallback Logic**: If API fails, uses keyword-based suggestions
5. **One-Click Send**: Users can click suggestions to auto-send them

The suggestions will now intelligently adapt based on what's been discussed, making the conversation flow more naturally and helping users discover relevant information about your CV!

Update your files with these changes and the suggestions feature will be fully functional! 🚀
