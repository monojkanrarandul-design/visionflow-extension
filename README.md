# 🎙️ VisionFlow

### **Understand the Web. Just Ask.**

VisionFlow is an **AI-powered browser assistant** that lets users understand and interact with the webpage they are currently viewing using **natural voice commands**.

Instead of manually searching through long pages, navigating complex interfaces, or switching between a browser and a separate AI tool, users can simply speak to VisionFlow. The system uses the current webpage's structure and content together with AI reasoning to understand the user's intent and provide relevant responses or interact with webpage elements.

> **Making web interaction more natural through AI and voice.**

---

## ✨ What VisionFlow Does

VisionFlow combines **voice interaction, webpage context, AI reasoning, and browser interaction** in a lightweight browser extension.

### Current capabilities

* 🎙️ Natural voice-based commands
* 🤖 AI-powered intent understanding
* 🌐 Current webpage context awareness
* 🧩 DOM and webpage element understanding
* 💬 Ask questions about the current webpage
* 🖱️ Interact with relevant webpage elements
* 📝 Assist with webpage forms and navigation
* 🔊 Voice and visual interaction feedback
* 🧩 Browser extension architecture
* ♿ Accessibility-focused interaction

### Example commands

```text
"What is this page about?"

"Summarize this article."

"Find the pricing information."

"Where is the contact information?"

"Explain this section."

"Click the login button."

"Fill this field."
```

---

# 🧠 How It Works

VisionFlow connects the user's voice with the context of the webpage they are currently viewing.

```text
          🎙️ User Voice
                │
                ▼
        Speech Recognition
                │
                ▼
       User Intent / Command
                │
                ▼
       Webpage Context
       ┌─────────────────┐
       │ DOM             │
       │ Visible Text    │
       │ Elements        │
       │ URL / Title     │
       └─────────────────┘
                │
                ▼
          AI Reasoning
                │
                ▼
      ┌─────────┴─────────┐
      │                   │
      ▼                   ▼
   AI Response       Page Interaction
```

VisionFlow does **not use computer vision**. It works with information exposed by the browser, including webpage structure, content, and interactive elements.

---

# 🏗️ Architecture

VisionFlow is split into two primary components:

```text
┌──────────────────────────────┐
│     VisionFlow Extension     │
│                              │
│  Voice Input                 │
│  Webpage / DOM Context       │
│  Browser Interaction         │
│  Side Panel UI               │
└──────────────┬───────────────┘
               │
               │ API Requests
               ▼
┌──────────────────────────────┐
│       VisionFlow API         │
│                              │
│  Flask REST API              │
│  AI Processing               │
│  Intent / Prompt Handling    │
│  Services & Routes           │
│  Authentication              │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
     AI Models     Database
```

---

# 💻 Technology Stack

## Browser Extension

* **JavaScript**
* **HTML**
* **CSS**
* **Chrome Extension APIs**
* DOM / webpage interaction
* Browser side panel architecture

The extension repository contains the browser extension structure including `manifest.json`, `sidepanel.html`, `setup.html`, JavaScript modules, CSS, and image assets.

## Backend

* **Python**
* **Flask**
* **REST API**
* **Flask-CORS**
* Modular route/service architecture
* Environment-based configuration
* AI model integration
* Vercel deployment

The API currently exposes a Flask application and registers its API routes through a blueprint, with CORS enabled.

The backend dependencies include Flask, Google GenAI, Google authentication libraries, HTTP clients, BeautifulSoup/lxml for web-content processing, Pydantic, python-dotenv, and related supporting packages.

---

# 📂 Repositories

### 🌐 Browser Extension

**VisionFlow Extension**

https://github.com/monojkanrarandul-design/visionflow-extension

The extension contains the browser-side implementation responsible for interacting with the webpage, handling the user interface, and communicating with the backend.

### ⚙️ Backend API

**VisionFlow API**

https://github.com/ap165/visionflow-api

The backend provides the API layer responsible for AI processing, routing, services, authentication, and communication between the extension and backend systems. The project is written in Python and uses Flask.

---

# 🚀 Project Vision

The long-term goal of VisionFlow is to make interacting with websites feel more like having a conversation.

Instead of forcing users to adapt themselves to every website's interface, VisionFlow aims to create an intelligent layer between people and the web.

### Today

**Ask → Understand → Respond**

### Future

**Ask → Understand → Plan → Interact → Complete**

Future development may include:

* Advanced multi-step browser interaction
* More intelligent task planning
* Richer webpage semantic understanding
* Productivity workflows
* Multi-language voice interaction
* Accessibility-focused experiences
* Browser-wide context
* Enterprise integrations

These are part of the roadmap and should not be interpreted as all being current capabilities.

---

# 🎯 Problem

Modern websites often require users to manually:

* Search through large amounts of information
* Read lengthy pages
* Navigate complex interfaces
* Find specific elements
* Fill repetitive forms
* Switch between multiple tools

VisionFlow aims to reduce this friction by allowing users to communicate with the webpage naturally through voice while AI understands the context.

---

# 🌍 Who Is It For?

VisionFlow is designed for:

* 🎓 Students
* 💼 Professionals
* 🔬 Researchers
* 🌐 Everyday internet users
* 📚 People who frequently read long webpages
* 🔎 Users who research and compare information
* 🗣️ People who prefer voice interaction
* ♿ Users who benefit from alternative web interaction methods

---

# 💡 Why VisionFlow?

### 🎙️ Voice First

Speak naturally instead of typing every request.

### 🌐 Page Aware

VisionFlow understands the webpage you are currently viewing.

### 🤖 AI Powered

AI interprets the user's intent and webpage context.

### 🧩 Browser Native

The experience happens directly within the browser.

### ⚡ Lightweight

VisionFlow is designed as a browser extension rather than requiring a separate application.

---

# 🏆 Competitive Landscape

VisionFlow operates in the emerging AI-assisted browsing space alongside products such as:

* Microsoft Copilot in Edge
* Google Gemini in Chrome
* Perplexity Comet

VisionFlow's focus is a **voice-first, webpage-context-aware browser assistant** that makes interacting with the web more natural.

---

# 🔐 Security & Privacy

VisionFlow should follow responsible handling of webpage and user data.

Sensitive information should never be unnecessarily exposed to external services, and API credentials should be stored using environment variables rather than committed to source control.

Never commit:

```text
API keys
JWT secrets
Database credentials
Private tokens
Environment files
```

---

# 🛠️ Development

Clone the repositories:

```bash
git clone https://github.com/monojkanrarandul-design/visionflow-extension.git
git clone https://github.com/ap165/visionflow-api.git
```

### Extension

Load the extension through the browser's developer/extension interface and use the repository's `manifest.json` as the extension entry configuration.

### API

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask application:

```bash
python main.py
```

The API is configured for CORS and exposes its application routes through Flask blueprints.

---

# 👥 Team

## 💡 Soumalya Kanrar

**Project Idea & Team Leader**

Responsible for the original VisionFlow idea, overall project direction, product vision, and team leadership.

## 🚀 Arijit Paine

**Lead Developer**

Responsible for core development, system integration, backend/API development, AI workflow, browser interaction, and technical architecture.

## 👨‍💻 Rajesh Mishra

**Developer**

Contributes to the development and implementation of VisionFlow.

## 👨‍💻 Gopal Samanta

**Developer**

Contributes to the development and implementation of VisionFlow.

---

# 🧭 Our Vision

> **Technology should adapt to people — not the other way around.**

The web contains an enormous amount of useful information, but interacting with it still depends heavily on traditional interfaces.

VisionFlow aims to make that interaction simpler:

**Speak naturally.
Let AI understand the context.
Interact with the web.**

---

# ⭐ Support VisionFlow

If you find VisionFlow interesting, consider giving the project a ⭐ on GitHub.

### Repositories

🌐 Extension
https://github.com/monojkanrarandul-design/visionflow-extension

⚙️ API
https://github.com/ap165/visionflow-api

---

<p align="center">

### 🎙️ VisionFlow

**Understand the Web. Just Ask.**

Built with ❤️ by the VisionFlow team.

</p>
