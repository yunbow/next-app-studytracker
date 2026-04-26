export const en = {
  common: {
    appName: "StudyTracker",
    login: "Login",
    logout: "Logout",
    register: "Sign Up",
    email: "Email",
    password: "Password",
    getStarted: "Get Started for Free",
    learnMore: "Learn More",
    cancel: "Cancel",
    nameNotSet: "Name not set",
    search: "Search",
    allCategories: "All Categories",
    sortBy: "Sort By",
    latest: "Latest",
    oldest: "Oldest",
  },
  study: {
    progress: "Progress",
    deadline: "Deadline",
  },
  nav: {
    home: "Dashboard",
    timer: "Timer",
    records: "Records",
    goals: "Goals",
    profile: "Profile",
    settings: "Settings",
  },
  accessibility: {
    skipToContent: "Skip to main content",
    userMenu: "User menu",
    selectLanguage: "Select language",
    selectTheme: "Select theme",
    selectFontSize: "Select font size",
    selectColorVision: "Select color vision support",
  },
  settings: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDescription:
      "Display settings such as language, theme, and font size",
    language: "Display Language",
    languageDescription: "Select the application display language",
    theme: "Theme",
    themeDescription: "Light, dark, or follow system settings",
    fontSize: "Font Size",
    fontSizeDescription: "Adjust text size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    colorVision: "Color Vision Support",
    colorVisionDescription:
      "Display adjustments for color vision characteristics",
    colorVisionNormal: "Normal",
    colorVisionProtanopia: "Protanopia (Red)",
    colorVisionDeuteranopia: "Deuteranopia (Green)",
    colorVisionTritanopia: "Tritanopia (Blue)",
    account: "Account Information",
    accountDescription: "Profile, password, account deletion, etc.",
  },
  language: {
    ja: "日本語",
    en: "English",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  sidebar: {
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    logout: "Logout",
    logoutConfirm: "Logout?",
    logoutDescription: "You will need to log in again after logging out.",
  },
  landing: {
    hero: {
      badge: "Focus, record, and review in one place",
      title: "Track Your Study Time, Achieve Your Goals",
      subtitle:
        "StudyTracker helps you stay focused with Pomodoro timer, visualize learning data, and maintain motivation with goal setting and badge system.",
      metrics: {
        focus: { value: "25m", label: "focus sessions" },
        goals: { value: "Weekly", label: "progress reviews" },
        badges: { value: "Wins", label: "shown as badges" },
      },
    },
    workflow: {
      eyebrow: "Learning Loop",
      title: "A repeatable flow for daily study",
      description:
        "Reduce friction before you start, record sessions naturally when you finish, and turn each study block into data you can review later.",
      timer: {
        title: "Start the timer",
        description:
          "Choose a subject or goal and begin. Focused study time is saved as a session.",
      },
      review: {
        title: "Review progress",
        description:
          "See today's study time, weekly totals, recent sessions, and progress toward active goals from the dashboard.",
      },
      keepGoing: {
        title: "Keep momentum",
        description:
          "Goals, deadlines, and badges help you notice progress and decide what to study next.",
      },
    },
    features: {
      eyebrow: "Features",
      title: "Key Features",
      description:
        "Timer, records, goals, and analytics work together so the review process stays smooth after each session.",
      timer: {
        title: "Timer Function",
        description:
          "Boost focus with Pomodoro timer and automatically record study time.",
      },
      analytics: {
        title: "Data Visualization",
        description:
          "View study time by week/month in graphs. Subject-wise analysis available.",
      },
      goals: {
        title: "Goal Setting",
        description:
          "Set learning goals and track progress. Plan systematically with deadline management.",
      },
      badges: {
        title: "Badge System",
        description:
          "Earn badges based on achievements. Motivation for continuous learning.",
      },
    },
    outcome: {
      eyebrow: "Dashboard",
      title: "Understand your study status at a glance",
      description:
        "The dashboard brings together today's study, weekly totals, active goals, and recent records. As your history grows, it becomes easier to decide what to study next.",
      today: {
        title: "See today's effort",
        description: "Check daily progress in minutes.",
      },
      week: {
        title: "Review weekly trends",
        description: "Spot consistency and uneven study patterns.",
      },
      next: {
        title: "Connect work to goals",
        description: "Track progress by subject and deadline.",
      },
    },
    cta: {
      title: "Start tracking from today's study session",
      description:
        "Start the timer, finish the session, and keep useful data for your next review.",
    },
  },
  profile: {
    editProfile: "Edit Profile",
    editTitle: "Edit Profile",
    registeredAt: "Registered: ",
    email: "Email",
    userId: "User ID",
    nameLabel: "Display Name",
    namePlaceholder: "Enter display name",
    userIdLabel: "User ID",
    userIdPlaceholder: "Alphanumeric, hyphens, underscores",
    userIdHelp: "3-30 characters, alphanumeric, hyphens, and underscores",
    imageHelp: "Click to change image (JPEG, PNG, GIF, WebP / 5MB max)",
    imageUpdated: "Profile image updated",
    updated: "Profile updated",
    saving: "Saving...",
    save: "Save",
  },
  auth: {
    loginTitle: "Login",
    registerTitle: "Sign Up",
    loginWithGoogle: "Login with Google",
    loginWithGitHub: "Login with GitHub",
    registerWithGoogle: "Sign up with Google",
    registerWithGitHub: "Sign up with GitHub",
    sendVerificationEmail: "Send Verification Email",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    verificationEmailSent: "Verification email sent",
    verificationEmailDescription:
      "Please click the link in the email to complete your registration.",
    devVerificationUrl: "Dev Environment: Verification URL",
  },
  footer: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    cookie: "Cookie Policy",
    creator: "Creator",
  },
  cookie: {
    message: "We use cookies to improve our service.",
    accept: "Accept",
  },
} as const;
