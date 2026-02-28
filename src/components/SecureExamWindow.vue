<template>
  <div class="secure-exam-container" @contextmenu.prevent>
    <!-- Header with Security Status -->
    <div class="exam-header">
      <div class="d-flex justify-content-between align-items-center p-3">
        <div>
          <h4 class="mb-0">{{ exam.title }}</h4>
          <small class="text-muted">{{ exam.role }}</small>
        </div>
        <div class="security-status">
          <span class="badge badge-warning mr-2" v-if="violations > 0">
            ⚠️ Violations: {{ violations }}/{{ maxViolations }}
          </span>
          <span class="badge badge-success">
            <font-awesome-icon :icon="['fas', 'shield-alt']" class="mr-1" />
            Secure Mode
          </span>
        </div>
      </div>
      
      <!-- Timer -->
      <div class="timer-bar p-2 bg-dark text-white text-center">
        <h5 class="mb-0">
          Time Remaining: 
          <span :class="{'text-danger': timeRemaining < 300}">
            {{ formatTime(timeRemaining) }}
          </span>
        </h5>
      </div>
    </div>

    <!-- Main Content -->
    <div class="exam-content p-4">
      <!-- Progress -->
      <div class="progress-section mb-4">
        <div class="d-flex justify-content-between mb-2">
          <span>Progress: {{ answeredCount }}/{{ totalQuestions }} Questions</span>
          <span>{{ Math.round((answeredCount/totalQuestions)*100) }}% Complete</span>
        </div>
        <b-progress :value="answeredCount" :max="totalQuestions" height="10px"></b-progress>
      </div>

      <!-- Questions -->
      <div class="questions-section">
        <div v-for="(question, index) in exam.questions" :key="index" class="question-card mb-4 p-3 border rounded">
          <p class="font-weight-bold mb-3">
            {{ index + 1 }}. {{ question.text }}
          </p>
          <div class="options ml-3">
            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item mb-2">
              <label class="d-flex align-items-center p-2 border rounded" 
                     :class="{'bg-light': answers[index] === option.value}">
                <input
                  type="radio"
                  :name="'question-' + index"
                  :value="option.value"
                  v-model="answers[index]"
                  class="mr-3"
                  @contextmenu.prevent
                  @copy.prevent
                  @cut.prevent
                  @paste.prevent
                >
                <span class="flex-grow-1" 
                      @copy.prevent 
                      @cut.prevent 
                      @paste.prevent
                      @contextmenu.prevent>{{ option.text }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="text-center mt-4">
        <b-button 
          variant="success" 
          size="lg"
          @click="submitExam"
          :disabled="answeredCount < totalQuestions"
        >
          <font-awesome-icon :icon="['fas', 'check-circle']" class="mr-2" />
          Submit Exam ({{ answeredCount }}/{{ totalQuestions }})
        </b-button>
      </div>
    </div>

    <!-- Security Warning Modal -->
    <b-modal v-model="showWarning" title="⚠️ Security Warning" hide-footer centered>
      <div class="text-center">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" size="3x" class="text-warning mb-3" />
        <h5>{{ warningMessage }}</h5>
        <p class="text-muted">Violation {{ violations }}/{{ maxViolations }}</p>
        <b-button variant="danger" @click="continueExam" class="mt-3">I Understand, Continue</b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'SecureExamWindow',
  props: {
    exam: {
      type: Object,
      required: true
    },
    duration: {
      type: Number,
      default: 3600 // seconds
    }
  },
  data() {
    return {
      answers: [],
      timeRemaining: this.duration,
      timerInterval: null,
      violations: 0,
      maxViolations: 3,
      showWarning: false,
      warningMessage: '',
      fullscreenEnabled: false,
      tabFocus: true
    }
  },
  computed: {
    totalQuestions() {
      return this.exam.questions?.length || 0
    },
    answeredCount() {
      return this.answers.filter(a => a !== null && a !== undefined).length
    }
  },
  created() {
    this.answers = new Array(this.totalQuestions).fill(null)
    this.initSecurity()
    this.startTimer()
  },
  mounted() {
    this.enableFullscreen()
    this.disableDevTools()
  },
  beforeDestroy() {
    this.cleanupSecurity()
  },
  methods: {
    initSecurity() {
      // Disable right click globally
      document.addEventListener('contextmenu', this.preventEvent)
      
      // Disable keyboard shortcuts
      document.addEventListener('keydown', this.preventKeyboardShortcuts)
      
      // Detect tab visibility change
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
      
      // Detect window blur (tab switch)
      window.addEventListener('blur', this.handleWindowBlur)
      
      // Detect fullscreen change
      document.addEventListener('fullscreenchange', this.handleFullscreenChange)
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange)
      document.addEventListener('mozfullscreenchange', this.handleFullscreenChange)
      document.addEventListener('MSFullscreenChange', this.handleFullscreenChange)
      
      // Disable copy/paste on all elements
      this.disableCopyPaste()
    },
    
    cleanupSecurity() {
      document.removeEventListener('contextmenu', this.preventEvent)
      document.removeEventListener('keydown', this.preventKeyboardShortcuts)
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      window.removeEventListener('blur', this.handleWindowBlur)
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
      
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
      }
    },
    
    preventEvent(e) {
      e.preventDefault()
      return false
    },
    
    preventKeyboardShortcuts(e) {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault()
        this.recordViolation('Developer tools access attempted')
        return false
      }
      
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault()
        this.recordViolation('Copy/Paste attempted')
        return false
      }
      
      // Prevent PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        this.recordViolation('Screenshot attempted')
        return false
      }
    },
    
    disableCopyPaste() {
      // Apply to all elements
      const elements = document.querySelectorAll('*')
      elements.forEach(el => {
        el.addEventListener('copy', this.preventEvent)
        el.addEventListener('cut', this.preventEvent)
        el.addEventListener('paste', this.preventEvent)
        el.addEventListener('selectstart', this.preventEvent)
      })
    },
    
    disableDevTools() {
      // Detect DevTools opening (works in some browsers)
      setInterval(() => {
        const start = performance.now()
        debugger // This will pause if DevTools is open
        const end = performance.now()
        if (end - start > 100) {
          this.recordViolation('Developer tools detected')
        }
      }, 1000)
    },
    
    handleVisibilityChange() {
      if (document.hidden) {
        this.recordViolation('Tab switching detected')
      }
    },
    
    handleWindowBlur() {
      this.recordViolation('Window focus lost')
    },
    
    handleFullscreenChange() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && !document.msFullscreenElement) {
        this.recordViolation('Fullscreen mode exited')
        this.enableFullscreen()
      }
    },
    
    enableFullscreen() {
      const element = document.documentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
    },
    
    recordViolation(reason) {
      this.violations++
      this.warningMessage = reason
      this.showWarning = true
      
      // Log violation (can be sent to server)
      console.warn(`Security Violation ${this.violations}/${this.maxViolations}: ${reason}`)
      
      // Auto-submit if max violations reached
      if (this.violations >= this.maxViolations) {
        this.submitExam(true) // Force submit
      }
      
      // Emit event for parent component
      this.$emit('violation', {
        count: this.violations,
        reason: reason,
        timestamp: new Date().toISOString()
      })
    },
    
    continueExam() {
      this.showWarning = false
      this.enableFullscreen()
    },
    
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
        } else {
          this.submitExam(true) // Auto-submit when time runs out
        }
      }, 1000)
    },
    
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}h ${mins}m ${secs}s`
      }
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    submitExam(force = false) {
      clearInterval(this.timerInterval)
      
      // Calculate score
      let correctAnswers = 0
      this.exam.questions.forEach((question, index) => {
        if (this.answers[index] === question.correctAnswer) {
          correctAnswers++
        }
      })
      
      const score = Math.round((correctAnswers / this.totalQuestions) * 100)
      
      // Prepare result
      const result = {
        answers: this.answers,
        score: score,
        timeSpent: this.duration - this.timeRemaining,
        violations: this.violations,
        submittedAt: new Date().toISOString(),
        forced: force
      }
      
      // Emit result to parent
      this.$emit('complete', result)
      
      // Close window
      window.close()
    }
  }
}
</script>

<style scoped>
.secure-exam-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none; /* Prevent text selection */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Prevent selection on all elements */
* {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}

.exam-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.security-status .badge {
  padding: 8px 12px;
  font-size: 0.9rem;
}

.timer-bar {
  background: linear-gradient(135deg, #1a2b3e 0%, #2c3e50 100%) !important;
  font-size: 1.2rem;
}

.exam-content {
  max-width: 900px;
  margin: 0 auto;
}

.question-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.option-item label {
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.option-item label:hover {
  background: #f8f9fa !important;
  border-color: #007bff !important;
}

.option-item input[type="radio"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  pointer-events: auto;
}

.option-item input[type="radio"]:checked + span {
  font-weight: 600;
  color: #007bff;
}

/* Disable text selection on options */
.option-item span {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none; /* Prevent selection but allow click */
}

/* Progress bar customization */
.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  background: linear-gradient(135deg, #007bff, #00bcd4);
  border-radius: 10px;
  transition: width 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .exam-content {
    padding: 10px !important;
  }
  
  .question-card {
    margin-bottom: 15px;
  }
}

/* Prevent drag and drop */
img, a, div {
  -webkit-user-drag: none;
  user-drag: none;
}

/* Blur effect for security warning */
.modal-open .secure-exam-container {
  filter: blur(3px);
  pointer-events: none;
}

.modal {
  z-index: 9999;
}

/* Disable text selection on entire app */
::selection {
  background: transparent;
}

::-moz-selection {
  background: transparent;
}
</style>