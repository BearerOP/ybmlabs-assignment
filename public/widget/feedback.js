;(() => {
  // Wait for DOM to be ready if needed
  function initWidget() {
  // Get project key from script tag
    // Handle both inline scripts (document.currentScript) and dynamically loaded scripts
    let currentScript = document.currentScript
    
    // If currentScript is null (dynamically loaded), find the script tag
    if (!currentScript) {
      // First try to find by ID (set by embed route)
      currentScript = document.getElementById('feedback-pulse-script')
      
      // If not found, find the script tag that loaded this file
      if (!currentScript) {
        const scripts = document.querySelectorAll('script[src*="feedback.js"]')
        // Get the last one (most likely the one that loaded this script)
        currentScript = scripts[scripts.length - 1]
      }
      
      // Fallback: try to find by data attribute
      if (!currentScript) {
        currentScript = document.querySelector("script[data-project-key]")
      }
      
      // Another fallback: find any script with this src
      if (!currentScript) {
        const allScripts = document.querySelectorAll('script[src*="feedback.js"]')
        currentScript = allScripts[allScripts.length - 1]
      }
    }
    
    if (!currentScript) {
      console.error("Feedback Pulse: Could not find script element. Please ensure the widget script is properly loaded.")
      return
    }
    
    const projectKey = currentScript.getAttribute("data-project-key")

  if (!projectKey) {
      console.error("Feedback Pulse: Missing data-project-key attribute. Make sure the script tag has data-project-key attribute set.")
      console.error("Feedback Pulse: Script element:", currentScript)
      console.error("Feedback Pulse: All attributes:", currentScript.attributes)
    return
  }

    console.log("Feedback Pulse: Widget initialized with project key:", projectKey)

  // Get the origin from the script src
    const scriptSrc = currentScript.src || ""
    // Handle both absolute URLs and relative paths
    let baseUrl = scriptSrc.replace("/widget/feedback.js", "").replace(/\/$/, "")
    if (!baseUrl || baseUrl === scriptSrc) {
      // Try to extract from full URL
      try {
        const url = new URL(scriptSrc)
        baseUrl = url.origin
      } catch {
        // Fallback logic
        if (scriptSrc.includes("localhost")) {
          baseUrl = "http://localhost:3000"
        } else {
          baseUrl = window.location.origin
        }
      }
    }
    
    console.log("Feedback Pulse: Using base URL:", baseUrl)

  // Create styles
  const style = document.createElement("style")
  style.textContent = `
    .feedback-pulse-btn {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      min-width: 56px !important;
      height: 52px !important;
      padding: 0 22px !important;
      border-radius: 14px !important;
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      color: #f7f9fb !important;
      cursor: pointer !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
      z-index: 2147483647 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                  border-color 0.2s ease,
                  background 0.2s ease !important;
      animation: feedback-pulse-glow 4s ease-in-out infinite,
                 feedback-pulse-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      outline: none !important;
      will-change: transform, box-shadow !important;
    }

    @keyframes feedback-pulse-enter {
      0% {
        transform: scale(0) rotate(-180deg);
        opacity: 0;
      }
      60% {
        transform: scale(1.1) rotate(10deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    .feedback-pulse-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 14px 38px rgba(0, 0, 0, 0.35) !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      background: rgba(255, 255, 255, 0.12) !important;
    }

    .feedback-pulse-btn:active {
      transform: translateY(0) scale(0.97) !important;
      transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .feedback-pulse-btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
    }

    .feedback-pulse-btn svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .feedback-pulse-btn-label {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.01em;
    }

    @keyframes feedback-pulse-glow {
      0%, 100% {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      }
      50% {
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
      }
    }

    .feedback-pulse-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(13, 14, 18, 0);
      backdrop-filter: blur(0px);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    .feedback-pulse-modal.active {
      opacity: 1;
      visibility: visible;
      background: rgba(13, 14, 18, 0.8);
      backdrop-filter: blur(8px);
      pointer-events: auto;
    }

    .feedback-pulse-content {
      background: #141519;
      border-radius: 20px;
      padding: 32px;
      max-width: 500px;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      transform: translateY(20px) scale(0.95);
      opacity: 0;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
    }

    .feedback-pulse-modal.active .feedback-pulse-content {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    .feedback-pulse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .feedback-pulse-title {
      font-size: 24px;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0;
    }

    .feedback-pulse-close {
      background: transparent;
      border: none;
      color: #868894;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .feedback-pulse-close:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #FFFFFF;
    }

    .feedback-pulse-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feedback-pulse-label {
      font-size: 14px;
      font-weight: 500;
      color: #E0E0E0;
      margin-bottom: 8px;
      display: block;
    }

    .feedback-pulse-type-group {
      display: flex;
      gap: 12px;
    }

    .feedback-pulse-type-btn {
      flex: 1;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #868894;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: scale(1);
      will-change: transform, background, border-color, color;
    }

    .feedback-pulse-type-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .feedback-pulse-type-btn.active {
      background: rgba(78, 234, 149, 0.15);
      border-color: #4EEA95;
      color: #4EEA95;
      transform: scale(1.02);
      box-shadow: 0 0 0 2px rgba(78, 234, 149, 0.2);
    }

    .feedback-pulse-input,
    .feedback-pulse-textarea {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .feedback-pulse-input:focus,
    .feedback-pulse-textarea:focus {
      outline: none;
      border-color: #4EEA95;
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(78, 234, 149, 0.15);
    }

    .feedback-pulse-textarea {
      min-height: 120px;
      resize: vertical;
    }

    .feedback-pulse-submit {
      background: linear-gradient(135deg, #4EEA95 0%, #3BD889 100%);
      color: #0D0E12;
      border: none;
      padding: 14px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 15px rgba(78, 234, 149, 0.3);
      transform: scale(1);
      will-change: transform, box-shadow;
    }

    .feedback-pulse-submit:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 20px rgba(78, 234, 149, 0.5);
    }

    .feedback-pulse-submit:active:not(:disabled) {
      transform: translateY(0) scale(0.98);
      transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .feedback-pulse-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: scale(1);
    }

    .feedback-pulse-error {
      padding: 12px;
      background: rgba(247, 85, 85, 0.1);
      border: 1px solid rgba(247, 85, 85, 0.2);
      border-radius: 12px;
      color: #F75555;
      font-size: 14px;
    }

    .feedback-pulse-success {
      text-align: center;
      padding: 40px 20px;
      animation: feedback-success-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes feedback-success-enter {
      0% {
        opacity: 0;
        transform: scale(0.8) translateY(10px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .feedback-pulse-success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      background: rgba(78, 234, 149, 0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: feedback-success-icon 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes feedback-success-icon {
      0% {
        transform: scale(0) rotate(-180deg);
      }
      60% {
        transform: scale(1.2) rotate(10deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
      }
    }

    .feedback-pulse-success-icon svg {
      width: 32px;
      height: 32px;
      stroke: #4EEA95;
    }

    .feedback-pulse-success-title {
      font-size: 20px;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 8px;
    }

    .feedback-pulse-success-text {
      font-size: 14px;
      color: #868894;
    }

    @media (max-width: 640px) {
      .feedback-pulse-btn {
        height: 48px;
        padding: 0 18px !important;
        bottom: 16px;
        right: 16px;
      }

      .feedback-pulse-content {
        padding: 24px;
      }

      .feedback-pulse-type-group {
        flex-direction: column;
      }
    }
  `
  document.head.appendChild(style)

    // Create floating button with layout ID
  const button = document.createElement("button")
  button.className = "feedback-pulse-btn"
    button.setAttribute("type", "button")
    button.setAttribute("aria-label", "Send Feedback")
    button.setAttribute("data-layout-id", "feedback-pulse-button")
  button.innerHTML = `
    <span class="feedback-pulse-btn-icon" aria-hidden="true">
      <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" class="nc-icon-wrapper">
          <path d="M1 9.99348C1.00003 11.624 1.44063 13.1472 2.19626 14.4646C2.38601 14.9255 2.27792 15.4945 2.15636 15.9568C1.97097 16.6619 1.62172 17.3398 1.21379 17.7485C1.0104 17.9522 0.945503 18.2561 1.04846 18.525C1.1515 18.7939 1.40329 18.9771 1.69077 18.9927C2.51536 19.0372 3.42875 18.8742 4.22582 18.6419C4.83702 18.4638 5.42053 18.2318 5.88387 17.9889C7.15411 18.645 8.57122 18.9955 10.0009 18.9955C14.9719 18.9954 18.9997 14.9668 19 9.99728C19 5.05316 15.0118 1.04141 10.0779 1C5.1088 1.00007 1 5.02371 1 9.99348Z" fill="url(#feedback-pulse-glass-base)" mask="url(#feedback-pulse-mask)"></path>
          <path d="M1 9.99348C1.00003 11.624 1.44063 13.1472 2.19626 14.4646C2.38601 14.9255 2.27792 15.4945 2.15636 15.9568C1.97097 16.6619 1.62172 17.3398 1.21379 17.7485C1.0104 17.9522 0.945503 18.2561 1.04846 18.525C1.1515 18.7939 1.40329 18.9771 1.69077 18.9927C2.51536 19.0372 3.42875 18.8742 4.22582 18.6419C4.83702 18.4638 5.42053 18.2318 5.88387 17.9889C7.15411 18.645 8.57122 18.9955 10.0009 18.9955C14.9719 18.9954 18.9997 14.9668 19 9.99728C19 5.05316 15.0118 1.04141 10.0779 1C5.1088 1.00007 1 5.02371 1 9.99348Z" fill="url(#feedback-pulse-glass-base)" filter="url(#feedback-pulse-blur)" clip-path="url(#feedback-pulse-clip)"></path>
          <path d="M22.75 14.4971C22.75 15.8083 22.3947 17.0325 21.7881 18.0918C21.4381 18.7473 22.0797 20.0133 22.5303 20.4648C22.7394 20.6742 22.8061 20.9874 22.7002 21.2637C22.5942 21.5399 22.3354 21.7282 22.04 21.7441C21.3651 21.7806 20.6264 21.6475 19.9893 21.4619C19.536 21.3299 19.098 21.1595 18.7354 20.9775C17.7323 21.4798 16.6207 21.7461 15.499 21.7461C11.4948 21.7459 8.2502 18.5019 8.25 14.5C8.25 10.498 11.4977 7.25 15.501 7.25C19.5037 7.25018 22.75 10.4949 22.75 14.4971Z" fill="url(#feedback-pulse-glass-ring)"></path>
          <path d="M22 14.4971C22 11.0214 19.2686 8.18279 15.835 8.00879L15.501 8C11.9118 8 9 10.9122 9 14.5C9.0002 18.0874 11.9088 20.9959 15.499 20.9961V21.7461C11.4948 21.7459 8.2502 18.5019 8.25 14.5C8.25 10.498 11.4977 7.25 15.501 7.25C19.5037 7.25018 22.75 10.4949 22.75 14.4971C22.75 15.8083 22.3947 17.0325 21.7881 18.0918C21.4381 18.7473 22.0797 20.0133 22.5303 20.4648C22.7394 20.6742 22.8061 20.9874 22.7002 21.2637C22.5942 21.5399 22.3354 21.7282 22.04 21.7441C21.3651 21.7806 20.6264 21.6475 19.9893 21.4619C19.536 21.3299 19.098 21.1595 18.7354 20.9775C17.7323 21.4798 16.6207 21.7461 15.499 21.7461V20.9961C16.5025 20.9961 17.4992 20.7574 18.3994 20.3066C18.6109 20.2007 18.8599 20.2016 19.0713 20.3076C19.389 20.467 19.7847 20.6214 20.1992 20.7422C20.7163 20.8928 21.2777 20.9965 21.7852 21L22 20.9951H21.999C21.683 20.6784 21.3597 20.1509 21.1582 19.6211C21.0549 19.3495 20.9707 19.0451 20.9453 18.7373C20.9203 18.4343 20.9483 18.0728 21.127 17.7383L21.1377 17.7188C21.6146 16.886 21.9171 15.9424 21.9854 14.9336L22 14.4971Z" fill="url(#feedback-pulse-glass-highlight)"></path>
          <defs>
            <linearGradient id="feedback-pulse-glass-base" x1="10" y1="1" x2="10" y2="19" gradientUnits="userSpaceOnUse">
              <stop stop-color="rgba(87, 87, 87, 1)"></stop>
              <stop offset="1" stop-color="rgba(21, 21, 21, 1)"></stop>
            </linearGradient>
            <linearGradient id="feedback-pulse-glass-ring" x1="15.5" y1="7.25" x2="15.5" y2="21.75" gradientUnits="userSpaceOnUse">
              <stop stop-color="rgba(227, 227, 229, 0.6)"></stop>
              <stop offset="1" stop-color="rgba(187, 187, 192, 0.6)"></stop>
            </linearGradient>
            <linearGradient id="feedback-pulse-glass-highlight" x1="15.5" y1="7.25" x2="15.5" y2="15.647" gradientUnits="userSpaceOnUse">
              <stop stop-color="rgba(255, 255, 255, 1)"></stop>
              <stop offset="1" stop-color="rgba(255, 255, 255, 0)"></stop>
            </linearGradient>
            <filter id="feedback-pulse-blur" x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="2" in="SourceGraphic" result="blur"></feGaussianBlur>
            </filter>
            <clipPath id="feedback-pulse-clip">
              <path d="M22.75 14.4971C22.75 15.8083 22.3947 17.0325 21.7881 18.0918C21.4381 18.7473 22.0797 20.0133 22.5303 20.4648C22.7394 20.6742 22.8061 20.9874 22.7002 21.2637C22.5942 21.5399 22.3354 21.7282 22.04 21.7441C21.3651 21.7806 20.6264 21.6475 19.9893 21.4619C19.536 21.3299 19.098 21.1595 18.7354 20.9775C17.7323 21.4798 16.6207 21.7461 15.499 21.7461C11.4948 21.7459 8.2502 18.5019 8.25 14.5C8.25 10.498 11.4977 7.25 15.501 7.25C19.5037 7.25018 22.75 10.4949 22.75 14.4971Z"></path>
            </clipPath>
            <mask id="feedback-pulse-mask">
              <rect width="100%" height="100%" fill="#FFF"></rect>
              <path d="M22.75 14.4971C22.75 15.8083 22.3947 17.0325 21.7881 18.0918C21.4381 18.7473 22.0797 20.0133 22.5303 20.4648C22.7394 20.6742 22.8061 20.9874 22.7002 21.2637C22.5942 21.5399 22.3354 21.7282 22.04 21.7441C21.3651 21.7806 20.6264 21.6475 19.9893 21.4619C19.536 21.3299 19.098 21.1595 18.7354 20.9775C17.7323 21.4798 16.6207 21.7461 15.499 21.7461C11.4948 21.7459 8.2502 18.5019 8.25 14.5C8.25 10.498 11.4977 7.25 15.501 7.25C19.5037 7.25018 22.75 10.4949 22.75 14.4971Z" fill="#000"></path>
            </mask>
          </defs>
        </g>
      </svg>
    </span>
    <span class="feedback-pulse-btn-label">Feedback</span>
  `

    // Create modal with layout ID
  const modal = document.createElement("div")
  modal.className = "feedback-pulse-modal"
    modal.setAttribute("data-layout-id", "feedback-pulse-modal")
    modal.style.display = "none" // Start hidden
  modal.innerHTML = `
    <div class="feedback-pulse-content" data-layout-id="feedback-pulse-content">
      <div class="feedback-pulse-header">
        <h2 class="feedback-pulse-title">Send Feedback</h2>
        <button class="feedback-pulse-close" type="button">&times;</button>
      </div>
      <form class="feedback-pulse-form" id="feedback-pulse-form" data-layout-id="feedback-pulse-form">
        <div>
          <label class="feedback-pulse-label">Type</label>
          <div class="feedback-pulse-type-group">
            <button type="button" class="feedback-pulse-type-btn active" data-type="BUG">🐛 Bug</button>
            <button type="button" class="feedback-pulse-type-btn" data-type="FEATURE">✨ Feature</button>
            <button type="button" class="feedback-pulse-type-btn" data-type="OTHER">💬 Other</button>
          </div>
        </div>
        <div>
          <label class="feedback-pulse-label" for="feedback-message">Message</label>
          <textarea
            id="feedback-message"
            class="feedback-pulse-textarea"
            placeholder="Tell us what's on your mind..."
            required
          ></textarea>
        </div>
        <div>
          <label class="feedback-pulse-label" for="feedback-email">Email (optional)</label>
          <input
            id="feedback-email"
            type="email"
            class="feedback-pulse-input"
            placeholder="your@email.com"
          />
        </div>
        <div id="feedback-error" style="display: none;"></div>
        <button type="submit" class="feedback-pulse-submit">Send Feedback</button>
      </form>
      <div class="feedback-pulse-success" id="feedback-success" style="display: none;">
        <div class="feedback-pulse-success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="feedback-pulse-success-title">Thank you!</div>
        <div class="feedback-pulse-success-text">Your feedback has been submitted.</div>
      </div>
    </div>
  `

  // Append to body
    if (!document.body) {
      console.error("Feedback Pulse: document.body not available. Waiting for DOM...")
      setTimeout(initWidget, 100)
      return
    }
    
  document.body.appendChild(button)
  document.body.appendChild(modal)
    
    console.log("Feedback Pulse: Button and modal added to page")

  // State
  let selectedType = "BUG"

    // Type selection with smooth transitions
  const typeButtons = modal.querySelectorAll(".feedback-pulse-type-btn")
    typeButtons.forEach((btn, index) => {
      btn.setAttribute("data-layout-id", `feedback-type-btn-${index}`)
    btn.addEventListener("click", () => {
        // Animate out previous active
        const prevActive = modal.querySelector(".feedback-pulse-type-btn.active")
        if (prevActive) {
          prevActive.style.transform = "scale(0.98)"
          setTimeout(() => {
            prevActive.classList.remove("active")
            prevActive.style.transform = ""
          }, 100)
        }
        
        // Animate in new active
        setTimeout(() => {
      btn.classList.add("active")
          btn.style.transform = "scale(1.05)"
          setTimeout(() => {
            btn.style.transform = ""
          }, 200)
        }, 50)
        
      selectedType = btn.getAttribute("data-type")
    })
  })

    // Function to open modal with smooth animation
    function openModal() {
      console.log("Feedback Pulse: Opening modal!")
      // Force reflow for animation
      modal.style.display = "flex"
      requestAnimationFrame(() => {
    modal.classList.add("active")
      })
      
      const messageEl = document.getElementById("feedback-message")
      const emailEl = document.getElementById("feedback-email")
      const formEl = document.getElementById("feedback-pulse-form")
      const successEl = document.getElementById("feedback-success")
      const errorEl = document.getElementById("feedback-error")
      
      if (messageEl) messageEl.value = ""
      if (emailEl) emailEl.value = ""
      if (formEl) {
        formEl.style.display = "flex"
        // Animate form elements
        requestAnimationFrame(() => {
          formEl.style.opacity = "0"
          formEl.style.transform = "translateY(10px)"
          setTimeout(() => {
            formEl.style.transition = "opacity 0.3s ease, transform 0.3s ease"
            formEl.style.opacity = "1"
            formEl.style.transform = "translateY(0)"
          }, 50)
        })
      }
      if (successEl) successEl.style.display = "none"
      if (errorEl) errorEl.style.display = "none"
    }
    
    // Function to close modal with smooth animation
    function closeModal() {
      modal.classList.remove("active")
      setTimeout(() => {
        modal.style.display = "none"
      }, 300) // Wait for animation to complete
    }

    // Add multiple event handlers to ensure clicks work
    button.onclick = function(e) {
      console.log("Feedback Pulse: onclick handler fired!")
      e.preventDefault()
      e.stopPropagation()
      openModal()
      return false
    }
    
    button.addEventListener("click", function(e) {
      console.log("Feedback Pulse: addEventListener click fired!")
      e.preventDefault()
      e.stopPropagation()
      openModal()
      return false
    }, true) // Use capture phase
    
    button.addEventListener("mousedown", function(e) {
      console.log("Feedback Pulse: mousedown fired!")
      e.preventDefault()
      e.stopPropagation()
      openModal()
      return false
    })
    
    // Also add touch events for mobile
    button.addEventListener("touchend", function(e) {
      console.log("Feedback Pulse: touchend fired!")
      e.preventDefault()
      e.stopPropagation()
      openModal()
      return false
    })
    
    // Make absolutely sure button is interactive
    button.style.pointerEvents = "auto"
    button.style.cursor = "pointer"
    button.style.zIndex = "2147483647"
    button.style.position = "fixed"
    button.tabIndex = 0 // Make it focusable
    
    // Ensure SVG doesn't block clicks
    const svg = button.querySelector('svg')
    if (svg) {
      svg.style.pointerEvents = "none"
    }
    
    // Add keyboard support
    button.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        console.log("Feedback Pulse: Keyboard event fired!")
        e.preventDefault()
        openModal()
      }
    })
    
    console.log("Feedback Pulse: Button setup complete. Event handlers attached:", {
      onclick: !!button.onclick,
      hasClickListeners: true
  })

  // Close modal
  const closeBtn = modal.querySelector(".feedback-pulse-close")
  closeBtn.addEventListener("click", () => {
      closeModal()
  })

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal()
      }
    })
    
    // Add escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeModal()
    }
  })

  // Submit form
  const form = document.getElementById("feedback-pulse-form")
  const errorDiv = document.getElementById("feedback-error")
  const successDiv = document.getElementById("feedback-success")

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const message = document.getElementById("feedback-message").value
    const email = document.getElementById("feedback-email").value
    const submitBtn = form.querySelector(".feedback-pulse-submit")

    // Clear previous errors
    errorDiv.style.display = "none"
    errorDiv.className = "feedback-pulse-error"
    errorDiv.textContent = ""

    // Disable submit button
    submitBtn.disabled = true
    submitBtn.textContent = "Sending..."

    try {
      const response = await fetch(`${baseUrl}/api/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectKey,
          type: selectedType,
          message,
          email: email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback")
      }

      // Show success
      form.style.display = "none"
      successDiv.style.display = "block"

      // Close modal after 2 seconds with smooth animation
      setTimeout(() => {
        closeModal()
      }, 2000)
    } catch (error) {
      errorDiv.textContent = error.message || "An error occurred. Please try again."
      errorDiv.style.display = "block"
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = "Send Feedback"
    }
  })
  } // End of initWidget function
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget)
  } else {
    // DOM already ready, but wait a bit for dynamically loaded scripts
    setTimeout(initWidget, 100)
  }
})()
