import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { 
    translation: { 
      // Navigation
      welcome: 'Welcome To eMirimo',
      heroTitle: 'Find Your Dream Remote Job in Rwanda',
      heroSubtitle: 'Connect with global opportunities while staying close to home. Join thousands of Rwandan professionals building their careers remotely.',
      getStarted: 'Get Started',
      login: 'Login',
      register: 'Register',
      jobs: 'Jobs',
      learning: 'Learning',
      applications: 'Applications',
      dashboard: 'Dashboard',
      home: 'Home',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      notifications: 'Notifications',
      messages: 'Messages',
      resources: 'Resources',
      help: 'Help',
      
      // Auth
      signIn: 'Sign In',
      signingIn: 'Signing In...',
      createAccount: 'Create Account',
      creatingAccount: 'Creating Account...',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: 'Don\'t have an account?',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      role: 'Role',
      seeker: 'Job Seeker',
      employer: 'Employer',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      sendResetLink: 'Send Reset Link',
      backToLogin: 'Back to Login',
      rememberMe: 'Remember Me',
      agreeTerms: 'I agree to the Terms and Conditions',
      
      // Jobs
      searchJobs: 'Search Jobs...',
      search: 'Search',
      apply: 'Apply',
      myApplications: 'My Applications',
      title: 'Title',
      description: 'Description',
      location: 'Location',
      type: 'Type',
      remote: 'Remote',
      hybrid: 'Hybrid',
      onsite: 'On-Site',
      skills: 'Skills',
      salary: 'Salary',
      experience: 'Experience',
      company: 'Company',
      postedDate: 'Posted Date',
      deadline: 'Application Deadline',
      requirements: 'Requirements',
      benefits: 'Benefits',
      jobDetails: 'Job Details',
      similarJobs: 'Similar Jobs',
      saveJob: 'Save Job',
      shareJob: 'Share Job',
      
      // Applications
      applied: 'Applied',
      shortlisted: 'Shortlisted',
      interview: 'Interview',
      offer: 'Offer',
      hired: 'Hired',
      rejected: 'Rejected',
      status: 'Status',
      applicationDate: 'Application Date',
      coverLetter: 'Cover Letter',
      resume: 'Resume',
      portfolio: 'Portfolio',
      applicationNotes: 'Application Notes',
      
      // Profile
      personalInfo: 'Personal Information',
      professionalInfo: 'Professional Information',
      education: 'Education',
      workExperience: 'Work Experience',
      certifications: 'Certifications',
      socialLinks: 'Social Links',
      editProfile: 'Edit Profile',
      viewProfile: 'View Profile',
      uploadPhoto: 'Upload Photo',
      updateProfile: 'Update Profile',
      
      // Dashboard
      recentActivity: 'Recent Activity',
      
      // Learning
      
      // Home Page Content
      remoteJobsTitle: 'Verified Remote Jobs',
      remoteJobsDesc: 'Access curated remote job opportunities from global companies that value Rwandan talent and offer competitive packages.',
      verifiedOppsTitle: 'Verified Opportunities',
      verifiedOppsDesc: 'All job postings are verified by our team to ensure legitimacy and quality opportunities for our community.',
      statsTitle: 'Join Our Growing Community',
      activeUsers: 'Active Users',
      jobsPosted: 'Jobs Posted',
      successfulHires: 'Successful Hires',
      ctaTitle: 'Ready to Start Your Remote Career Journey?',
      ctaSubtitle: 'Join thousands of Rwandan professionals who have found their dream remote jobs through eMirimo.',
      ctaTagline: 'Your next opportunity is just one click away.',
      startJourney: 'Start Your Journey',
      exploreOpps: 'Explore Opportunities',
      
      // Common Actions
      salaryNotSpecified: 'Salary not specified',
      
      // Form Labels
      
      // Time
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisYear: 'This Year',
      
      // Status
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      draft: 'Draft',
      published: 'Published',
      
      // Messages
      noData: 'No data available',
      noResults: 'No results found',
      tryAgain: 'Try Again',
      somethingWentWrong: 'Something went wrong',
      pleaseTryAgain: 'Please try again',
      
      // Comments
      comment: 'Comment',
      
      // Theme
      theme: 'Theme',
      
      // Language
      language: 'Language',
      english: 'English',
      kinyarwanda: 'Kinyarwanda',
      
      // Dashboard Statistics
      applicationsSent: 'Applications Sent',
      interviewsScheduled: 'Interviews Scheduled',
      profileComplete: 'Profile Complete',
      newOpportunities: 'New Opportunities',
      activeJobs: 'Active Jobs',
      totalApplications: 'Total Applications',
      hiredCandidates: 'Hired Candidates',
      totalUsers: 'Total Users',
      totalJobs: 'Total Jobs',
      totalNotifications: 'Total Notifications',
      pendingReview: 'Pending review',
      
      // Dashboard Sections
      jobSearch: 'Job Search',
      viewAll: 'View All',
      browseJobs: 'Browse Jobs',
      findRemoteOpps: 'Find remote opportunities',
      trackApplicationStatus: 'Track application status',
      improveVisibility: 'Improve your visibility',
      recommendedForYou: 'Recommended for You',
      aiPoweredMatches: 'AI-powered job matches based on your profile',
      viewAllJobs: 'View All Jobs',
      learningResources: 'Learning Resources',
      viewAllResources: 'View All Resources',
      boostYourSkills: 'Boost Your Skills',
      accessPersonalizedLearning: 'Access personalized learning resources to improve your job prospects',
      exploreLearningResources: 'Explore Learning Resources',
      aiRecommendations: 'AI Recommendations',
      personalizedForProfile: 'Personalized for your profile',
      getPersonalizedRecommendations: 'Get Personalized Recommendations',
      aiPoweredJobCourse: 'AI-powered job and course recommendations based on your skills, education, and experience',
      viewAiRecommendations: 'View AI Recommendations',
      learningDevelopment: 'Learning & Development',
      enhanceSkillsCurated: 'Enhance your skills with curated content',
      upskillForSuccess: 'Upskill for Success',
      accessCoursesTutorials: 'Access courses, tutorials, and resources to bridge skill gaps and advance your career',
      startLearning: 'Start Learning',
      
      // Employer Dashboard
      employerDashboard: 'Employer Dashboard',
      manageJobPostings: 'Manage your job postings and track hiring progress',
      postNewJob: 'Post New Job',
      jobManagement: 'Job Management',
      createNewJobListing: 'Create a new job listing',
      listOfJobs: 'List of Jobs',
      viewManageJobPostings: 'View and manage your job postings',
      recentHiringActivity: 'Recent Hiring Activity',
      reviewApplications: 'Review Applications',
      screenEvaluateCandidates: 'Screen and evaluate candidates',
      scheduleInterviews: 'Schedule Interviews',
      setUpCandidateInterviews: 'Set up candidate interviews',
      managePipeline: 'Manage Pipeline',
      trackCandidatesHiring: 'Track candidates through hiring stages',
      interviewSchedule: 'Interview Schedule',
      viewUpcomingInterviews: 'View upcoming interviews',
      makeHiringDecisions: 'Make Hiring Decisions',
      finalizeCandidateSelections: 'Finalize candidate selections',
      
      // Admin Dashboard
      adminDashboard: 'Admin Dashboard',
      platformOverview: 'Welcome back, {{name}}. Here\'s your platform overview.',
      live: 'Live',
      refresh: 'Refresh',
      lastUpdated: 'Last updated: {{date}}',
      manageUsers: 'Manage Users',
      viewManageAllUsers: 'View and manage all users',
      manageJobs: 'Manage Jobs',
      reviewManageJobPostings: 'Review and manage job postings',
      manageSystemNotifications: 'Manage system notifications',
      
      // Activity Feed
      appliedToSoftwareEngineer: 'Applied to Software Engineer at TechCorp',
      applicationSubmittedSuccessfully: 'Your application has been submitted successfully',
      interviewScheduledTomorrow: 'Interview scheduled for tomorrow',
      frontendDeveloperPosition: 'Frontend Developer position at StartupXYZ',
      profileUpdatedSuccessfully: 'Profile updated successfully',
      profileNowComplete: 'Your profile is now 95% complete',
      newApplicationSoftwareEngineer: 'New application for Software Engineer position',
      applicationFromSarahJohnson: 'Application from Sarah Johnson',
      interviewScheduledMikeChen: 'Interview scheduled with Mike Chen',
      jobPostingProductManager: 'Job posting "Product Manager" published',
      jobNowLiveAccepting: 'Job is now live and accepting applications',
      newUserRegistration: 'New User Registration',
      newJobPosted: 'New Job Posted',
      newApplication: 'New Application',
      
      // Time References
      hoursAgo: '{{count}} hours ago',
      daysAgo: '{{count}} days ago',
      minutesAgo: '{{count}} minutes ago',
      
      // Error Messages
      loginSuccessful: 'Login Successful',
      welcomeBack: 'Welcome back, {{name}}!',
      loginFailed: 'Login Failed',
      unexpectedError: 'An unexpected error occurred',
      invalidCredentials: 'Invalid Credentials',
      checkEmailPassword: 'Please check your email and password and try again.',
      accountNotFound: 'Account Not Found',
      noAccountFound: 'No account found with this email address. Please check your email or create a new account.',
      accountNotVerified: 'Account Not Verified',
      verifyAccount: 'Please check your email and verify your account before logging in.',
      userNotFound: 'User not found',
      applicationFailed: 'Application failed',
      failedSubmitApplication: 'Failed to submit application',
      noRecommendationsAvailable: 'No recommendations available',
      failedLoadDashboardData: 'Failed to load dashboard data. Please try again.',
      failedLoadEmployerData: 'Failed to load employer data',
      failedLoadFallbackData: 'Failed to load fallback data',
      connectionFailed: 'Connection Failed',
      unableToConnect: 'Unable to connect to the server. Please check your internet connection and try again.',
      
      // Common UI Text
      poweredByAi: 'Powered by AI',
      unknown: 'Unknown',
      pleaseLogInAccess: 'Please Log In To Access Your Dashboard',
      unknownUserRole: 'Unknown User Role: {{role}}',
      contactSupportAssistance: 'Please contact support for assistance.',
      loadingDashboard: 'Loading dashboard...',
      dashboardEndpointNotAvailable: 'Dashboard endpoint not available, using fallback',
      mockCalculation: 'Mock calculation - in real app, this would check profile completeness'
    } 
  },
  rw: { 
    translation: { 
      // Navigation
      welcome: 'Murakaza neza kuri eMirimo',
      heroTitle: 'Shakisha akazi kawe ka kure mu Rwanda',
      heroSubtitle: 'Huza n\'amahirwe y\'isi yose mugihe ukomeza mu Rwanda. Jya hamwe n\'abantu benshi bo mu Rwanda bakora akazi ka kure.',
      getStarted: 'Tangira',
      login: 'Injira',
      register: 'Iyandikishe',
      jobs: 'Akazi',
      learning: 'Kwiga',
      applications: 'Gusaba',
      dashboard: 'Urufunguzo',
      home: 'Urugo',
      logout: 'Sohoka',
      profile: 'Umwirondoro',
      settings: 'Igenamiterere',
      notifications: 'Amakuru',
      messages: 'Ubutumwa',
      resources: 'Ibikoresho',
      help: 'Ubufasha',

      // Auth
      signIn: 'Injira',
      signingIn: 'Birakoresha...',
      createAccount: 'Kora Konti',
      creatingAccount: 'Birakora Konti...',
      alreadyHaveAccount: 'Ufite konti?',
      dontHaveAccount: 'Nta konti ufite?',
      email: 'Imeli',
      password: 'Ijambo ry\'ibanga',
      confirmPassword: 'Emeza ijambo ry\'ibanga',
      name: 'Amazina yose',
      role: 'Uruhare',
      seeker: 'Ushaka akazi',
      employer: 'Umutunzi w\'akazi',
      forgotPassword: 'Wibagiwe ijambo ry\'ibanga?',
      resetPassword: 'Vugurura ijambo ry\'ibanga',
      sendResetLink: 'Ohereza umuyoboro wo kuvugurura',
      backToLogin: 'Subira kwinjira',
      rememberMe: 'Ntibagire',
      agreeTerms: 'Nemeranya n\'amabwiriza n\'amabwiriza',

      // Jobs
      searchJobs: 'Shakisha akazi...',
      search: 'Shakisha',
      apply: 'Saba',
      myApplications: 'Gusaba zanjye',
      title: 'Umutwe',
      description: 'Ibisobanuro',
      location: 'Aho biherereye',
      type: 'Ubwoko',
      remote: 'Mu kure',
      hybrid: 'Byombi',
      onsite: 'Ku kazi',
      skills: 'Ubuhanga',
      salary: 'Umushahara',
      experience: 'Ubuhanga',
      company: 'Isosiyete',
      postedDate: 'Itariki yashyizwe',
      deadline: 'Igihe cyo gusaba',
      requirements: 'Ibyifuzo',
      benefits: 'Amanfa',
      jobDetails: 'Ibisobanuro by\'akazi',
      similarJobs: 'Akazi kimwe',
      saveJob: 'Bika akazi',
      shareJob: 'Sangira akazi',

      // Applications
      applied: 'Byasabwe',
      shortlisted: 'Byahisemo',
      interview: 'Icyiyumviro',
      offer: 'Gutanga',
      hired: 'Byakorewe',
      rejected: 'Byanze',
      status: 'Imiterere',
      applicationDate: 'Itariki yo gusaba',
      coverLetter: 'Inyandiko y\'akazi',
      resume: 'Umwirondoro',
      portfolio: 'Umwirondoro',
      applicationNotes: 'Ibyandikwa byo gusaba',

      // Profile
      personalInfo: 'Amakuru y\'umuntu',
      professionalInfo: 'Amakuru y\'akazi',
      education: 'Uburezi',
      workExperience: 'Ubuhanga bwo mu kazi',
      certifications: 'Icyemezo',
      socialLinks: 'Ihuza ry\'imbuga nkoranyambaga',
      editProfile: 'Genzura umwirondoro',
      viewProfile: 'Reba umwirondoro',
      uploadPhoto: 'Ohereza ifoto',
      updateProfile: 'Vugurura umwirondoro',

      // Dashboard
      recentActivity: 'Ibyakozwe vuba',
      
      // Learning
      
      // Home Page Content
      remoteJobsTitle: 'Akazi ka kure byemejwe',
      remoteJobsDesc: 'Fata amahirwe y\'akazi ka kure yemeranywe kuva ku masosiyete y\'isi yose yifatanya ubuhanga bwo mu Rwanda.',
      verifiedOppsTitle: 'Amahirwe yemejwe',
      verifiedOppsDesc: 'Akazi byose byashyizwe byemejwe n\'itsinda ryacu kugira ngo bikore neza kandi bikire amahirwe meza ku bantu bacu.',
      statsTitle: 'Jya hamwe n\'itsinda ryacu rikura',
      activeUsers: 'Abakoresha bikora',
      jobsPosted: 'Akazi byashyizwe',
      successfulHires: 'Abantu bakorewe neza',
      ctaTitle: 'Witeguye gutangira urugendo rwawe rw\'akazi ka kure?',
      ctaSubtitle: 'Jya hamwe n\'abantu benshi bo mu Rwanda bishakishije akazi kawe ka kure binyuze kuri eMirimo.',
      ctaTagline: 'Amahirwe yawe akurikira ari hafi gusa.',
      startJourney: 'Tangira urugendo rwawe',
      exploreOpps: 'Shakisha amahirwe',
      
      // Common Actions
      salaryNotSpecified: 'Umushahara ntawushyizwe',
      
      // Form Labels
      phone: 'Numero ya telefone',
      
      // Time
      today: 'Uyu munsi',
      yesterday: 'Ejo',
      thisWeek: 'Iki cyumweru',
      thisMonth: 'Uku kwezi',
      thisYear: 'Uku mwaka',
      
      // Status
      active: 'Bikora',
      inactive: 'Ntibikora',
      pending: 'Gitegereje',
      approved: 'Byemejwe',
      draft: 'Inyandiko',
      published: 'Byashyizwe',
      
      // Messages
      noData: 'Nta makuru ariho',
      noResults: 'Nta makuru yabonetse',
      tryAgain: 'Gerageza nanone',
      somethingWentWrong: 'Ikintu cyanze',
      pleaseTryAgain: 'Nyamuneka ugerageze nanone',
      
      // Comments
      comment: 'Vuga',

      // Theme
      theme: 'Imiterere',

      // Language
      language: 'Ururimi',
      english: 'Icyongereza',
      kinyarwanda: 'Ikinyarwanda',
      
      // Dashboard Statistics
      applicationsSent: 'Gusaba byoherejwe',
      interviewsScheduled: 'Icyiyumviro byagenewe',
      profileComplete: 'Umwirondoro wuzuye',
      newOpportunities: 'Amahirwe mashya',
      activeJobs: 'Akazi gikora',
      totalApplications: 'Gusaba byose',
      hiredCandidates: 'Abantu bakorewe',
      totalUsers: 'Abakoresha byose',
      totalJobs: 'Akazi byose',
      totalNotifications: 'Amakuru byose',
      pendingReview: 'Gitegereje gusuzuma',
      
      // Dashboard Sections
      jobSearch: 'Gushakisha akazi',
      viewAll: 'Reba byose',
      browseJobs: 'Reba akazi',
      findRemoteOpps: 'Shakisha amahirwe mu kure',
      trackApplicationStatus: 'Reba imiterere y\'akazi',
      improveVisibility: 'Gira neza uboneka',
      recommendedForYou: 'Byemeranywe nawe',
      aiPoweredMatches: 'Gushakisha akazi kwa AI kubera umwirondoro wawe',
      viewAllJobs: 'Reba akazi byose',
      learningResources: 'Ibikoresho byo kwiga',
      viewAllResources: 'Reba ibikoresho byose',
      boostYourSkills: 'Gira ubuhanga bwo hejuru',
      accessPersonalizedLearning: 'Fata ibikoresho byo kwiga byemeranywe kugira ngo ugerereze amahirwe yawe',
      exploreLearningResources: 'Shakisha ibikoresho byo kwiga',
      aiRecommendations: 'Ibyemeranywe kwa AI',
      personalizedForProfile: 'Byemeranywe kubera umwirondoro wawe',
      getPersonalizedRecommendations: 'Fata ibyemeranywe byemeranywe',
      aiPoweredJobCourse: 'Ibyemeranywe by\'akazi n\'amashuri kwa AI kubera ubuhanga, uburezi, n\'ubuhanga bwawe',
      viewAiRecommendations: 'Reba ibyemeranywe kwa AI',
      learningDevelopment: 'Kwiga no Gukura',
      enhanceSkillsCurated: 'Gira ubuhanga bwo hejuru n\'ibikoresho byo kwiga byemeranywe',
      upskillForSuccess: 'Gira ubuhanga bwo hejuru kugira ngo ushinde',
      accessCoursesTutorials: 'Fata amashuri, amashuri, n\'ibikoresho kugira ngo ugerereze ubuhanga bwo mu kazi n\'ubuzima bwawe',
      startLearning: 'Tangira kwiga',
      
      // Employer Dashboard
      employerDashboard: 'Urufunguzo rw\'umutunzi w\'akazi',
      manageJobPostings: 'Genzura akazi gashyizwe n\'imiterere y\'akazi',
      postNewJob: 'Shyira akazi gashya',
      jobManagement: 'Genzura akazi',
      createNewJobListing: 'Kora akazi gashya',
      listOfJobs: 'Urutonde rw\'akazi',
      viewManageJobPostings: 'Reba no genzura akazi gashyizwe',
      recentHiringActivity: 'Ibyakozwe vuba mu gushakisha abantu',
      reviewApplications: 'Suzuma gusaba',
      screenEvaluateCandidates: 'Suzuma no gerageza abantu',
      scheduleInterviews: 'Gena icyiyumviro',
      setUpCandidateInterviews: 'Gena icyiyumviro ry\'abantu',
      managePipeline: 'Genzura urufunguzo',
      trackCandidatesHiring: 'Reba abantu mu nzira yo gushakisha abantu',
      interviewSchedule: 'Gena icyiyumviro',
      viewUpcomingInterviews: 'Reba icyiyumviro gikurikira',
      makeHiringDecisions: 'Kora ibyemezo byo gushakisha abantu',
      finalizeCandidateSelections: 'Genzura abantu bahisemo',
      
      // Admin Dashboard
      adminDashboard: 'Urufunguzo rw\'umuyobozi',
      platformOverview: 'Murakaza neza, {{name}}. Dore imiterere y\'urubuga.',
      live: 'Bikora',
      refresh: 'Vugurura',
      lastUpdated: 'Vuguruwe vuba: {{date}}',
      manageUsers: 'Genzura abakoresha',
      viewManageAllUsers: 'Reba no genzura abakoresha byose',
      manageJobs: 'Genzura akazi',
      reviewManageJobPostings: 'Suzuma no genzura akazi gashyizwe',
      manageSystemNotifications: 'Genzura amakuru y\'urubuga',
      
      // Activity Feed
      appliedToSoftwareEngineer: 'Byasabwe kuri Software Engineer muri TechCorp',
      applicationSubmittedSuccessfully: 'Gusaba kwawe byoherejwe neza',
      interviewScheduledTomorrow: 'Icyiyumviro byagenewe ejo',
      frontendDeveloperPosition: 'Umwanya w\'umunyamubano w\'imbere muri StartupXYZ',
      profileUpdatedSuccessfully: 'Umwirondoro wavuguruwe neza',
      profileNowComplete: 'Umwirondoro wawe ubu ni 95% wuzuye',
      newApplicationSoftwareEngineer: 'Gusaba gushya kuri Software Engineer',
      applicationFromSarahJohnson: 'Gusaba kuva kuri Sarah Johnson',
      interviewScheduledMikeChen: 'Icyiyumviro byagenewe na Mike Chen',
      jobPostingProductManager: 'Akazi "Product Manager" gashyizwe',
      jobNowLiveAccepting: 'Akazi ubu ni gikora kandi gakira gusaba',
      newUserRegistration: 'Kwiyandikisha kw\'umukoresha mushya',
      newJobPosted: 'Akazi gashya gashyizwe',
      newApplication: 'Gusaba gushya',
      
      // Time References
      hoursAgo: 'Amasaha {{count}} yashize',
      daysAgo: 'Iminsi {{count}} yashize',
      minutesAgo: 'Amaminota {{count}} yashize',
      
      // Error Messages
      loginSuccessful: 'Kwinjira byakozwe neza',
      welcomeBack: 'Murakaza neza, {{name}}!',
      loginFailed: 'Kwinjira byanze',
      unexpectedError: 'Ikosa ridasanzwe ryabaye',
      invalidCredentials: 'Amakuru y\'akazi atari ukuri',
      checkEmailPassword: 'Gerageza imeli yawe n\'ijambo ry\'ibanga hanyuma ugerageze nanone.',
      accountNotFound: 'Konti ntabwo yabonetse',
      noAccountFound: 'Nta konti yabonetse n\'iyi imeli. Nyamuneka gerageza imeli yawe cyangwa kora konti nshya.',
      accountNotVerified: 'Konti ntabwo yemejwe',
      verifyAccount: 'Nyamuneka gerageza imeli yawe hanyuma ugaragaze konti yawe mbere yo kwinjira.',
      userNotFound: 'Umukoresha ntabwo yabonetse',
      applicationFailed: 'Gusaba byanze',
      failedSubmitApplication: 'Gusaba ntabwo byoherejwe',
      noRecommendationsAvailable: 'Nta byemeranywe bihari',
      failedLoadDashboardData: 'Gusubira amakuru y\'urufunguzo byanze. Gerageza nanone.',
      failedLoadEmployerData: 'Gusubira amakuru y\'umutunzi w\'akazi byanze',
      failedLoadFallbackData: 'Gusubira amakuru y\'inyongera byanze',
      connectionFailed: 'Guhuza byanze',
      unableToConnect: 'Ntibishoboka guhuza na seriveri. Nyamuneka gerageza ubwoba bwawe bwa interineti hanyuma ugerageze nanone.',
      
      // Common UI Text
      poweredByAi: 'Bikoresha AI',
      unknown: 'Ntabwo bizwi',
      pleaseLogInAccess: 'Nyamuneka winjire kugira ngo ufate urufunguzo rwawe',
      unknownUserRole: 'Uruhare rw\'umukoresha rudasanzwe: {{role}}',
      contactSupportAssistance: 'Nyamuneka uhamagare ubufasha kugira ngo ubafashe.',
      loadingDashboard: 'Birakoresha urufunguzo...',
      dashboardEndpointNotAvailable: 'Urufunguzo rw\'urubuga rutariho, dukoresha inyongera',
      mockCalculation: 'Ibarura ry\'inyongera - mu rubuga rw\'ukuri, iyi ni yo yasuzumaga ukuzuza k\'umwirondoro'
    } 
  }
};

i18n.use(initReactI18next).init({
  resources, 
  lng: localStorage.getItem('language') || 'en', 
  fallbackLng: 'en', 
  interpolation: {
    escapeValue: false 
  }
});

export default i18n;