<template>
  <div class="seeker-dashboard p-4">
    <div class="dashboard-content">
      <div class="welcome-section">
        <div class="welcome-text">
          <h1>
            Welcome back,
            <span class="text-primary">{{
              currentUser.name || "Student"
            }}</span>
          </h1>
          <p class="text-muted ml-2" style="font-style: italic">
            {{ currentUser.email }}
          </p>
        </div>
        <b-button
          style="
            background-color: #e11d48;
            color: white;
            border: none;
            font-weight: 500;
          "
          @click="logout"
          class="logout-btn"
        >
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2" />
          Sign out
        </b-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-icon bg-primary-soft">
          <font-awesome-icon
            :icon="['fas', 'clipboard-list']"
            class="text-primary"
          />
        </div>
        <div class="stat-info">
          <span class="stat-label">Available Exams</span>
          <span class="stat-value">{{ stats.availableExams }}</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon bg-success-soft">
          <font-awesome-icon
            :icon="['fas', 'circle-check']"
            class="text-success"
          />
        </div>
        <div class="stat-info">
          <span class="stat-label">Completed</span>
          <span class="stat-value">{{ stats.completed }}</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon bg-warning-soft">
          <font-awesome-icon :icon="['fas', 'star']" class="text-warning" />
        </div>
        <div class="stat-info">
          <span class="stat-label">Avg. Score</span>
          <span class="stat-value">{{ stats.averageScore }}%</span>
        </div>
      </div>
    </div>

    <!-- Available Exams Section - Dynamic from Company -->
    <b-card class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="h5 mb-0">
          <font-awesome-icon :icon="['fas', 'clipboard-list']" class="mr-2" />
          Available Exams
          <b-badge
            :class="[
              'available-badge ml-2',
              { pulse: availableExams.length > 0 },
            ]"
          >
            {{ availableExams.length }}
          </b-badge>
        </h4>
        <div class="d-flex">
          <b-form-input
            v-model="examSearch"
            placeholder="Search exams..."
            size="sm"
            class="mr-2"
            style="width: 200px"
          ></b-form-input>
          <b-button size="sm" variant="outline-primary" @click="refreshExams">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
          </b-button>
        </div>
      </div>

      <b-table
        :items="filteredAvailableExams"
        :fields="availableExamFields"
        responsive
        hover
        show-empty
        :tbody-tr-class="rowClass"
      >
        <template #empty>
          <div class="text-center p-4">
            <font-awesome-icon
              :icon="['fas', 'inbox']"
              size="2x"
              class="text-muted mb-2"
            />
            <p class="text-muted mb-0">No exams available at the moment</p>
          </div>
        </template>

        <template #cell(status)="data">
          <div class="status-badge-with-icon">
            <b-badge
              :variant="getStatusVariant(data.item.status)"
              :title="data.item.disabledReason || data.item.status"
            >
              <font-awesome-icon
                :icon="getStatusIcon(data.item.status, data.item)"
                class="mr-1"
              />
              {{ data.item.statusMessage || data.item.status }}
            </b-badge>
            <small v-if="data.item.alreadyCompleted" class="text-success ml-1">
              <font-awesome-icon :icon="['fas', 'check-circle']" size="sm" />
            </small>
          </div>
        </template>

        <template #cell(duration)="data"> {{ data.value }} min </template>

        <template #cell(studentsCount)="data">
          <small>
            <font-awesome-icon :icon="['fas', 'users']" class="mr-1" />
            {{ data.value }} enrolled
          </small>
        </template>

        <template #cell(action)="data">
          <div>
            <!-- For Active exams that are available -->
            <b-button
              v-if="data.item.status === 'Active' && !data.item.disabled"
              size="sm"
              variant="success"
              @click="startExam(data.item)"
            >
              <font-awesome-icon :icon="['fas', 'play']" class="mr-1" />
              Start Exam
            </b-button>

            <!-- For exams that are already completed by student -->
            <b-button
              v-else-if="data.item.alreadyCompleted"
              size="sm"
              style="background-color: #28a745; border: none"
              disabled
              class="opacity-50"
              :title="
                'You completed this exam on ' +
                (myResults.find((r) => r.examTitle === data.item.title)?.date ||
                  'previous date')
              "
            >
              <font-awesome-icon :icon="['fas', 'check-circle']" class="mr-1" />
              Completed
            </b-button>

            <!-- For exams closed by company -->
            <b-button
              v-else-if="data.item.companyCompleted"
              size="sm"
              variant="dark"
              disabled
              class="opacity-50"
              title="This exam has been closed by the company"
            >
              <font-awesome-icon :icon="['fas', 'lock']" class="mr-1" />
              Closed
            </b-button>

            <!-- For expired exams -->
            <b-button
              v-else-if="data.item.status === 'Expired'"
              size="sm"
              variant="danger"
              disabled
              class="opacity-50"
              title="Exam deadline has passed"
            >
              <font-awesome-icon :icon="['fas', 'clock']" class="mr-1" />
              Expired
            </b-button>

            <!-- For scheduled/upcoming exams -->
            <b-button
              v-else
              size="sm"
              variant="info"
              disabled
              class="opacity-50"
              :title="data.item.disabledReason || 'Not available'"
            >
              <font-awesome-icon :icon="['fas', 'calendar']" class="mr-1" />
              {{ data.item.statusMessage || "Upcoming" }}
            </b-button>
          </div>
        </template>
      </b-table>
    </b-card>

    <!-- My Exam Results -->
    <b-card class="mb-4">
      <h4 class="h5 mb-3">
        <font-awesome-icon :icon="['fas', 'chart-line']" class="mr-2" />
        My Exam Results
        <b-badge
          :class="[
            'available-badge ml-2',
            { pulse: availableExams.length > 0 },
          ]"
          >{{ myResults.length }}</b-badge
        >
      </h4>

      <b-table
        :items="myResults"
        :fields="resultFields"
        responsive
        hover
        show-empty
      >
        <template #empty>
          <div class="text-center p-4">
            <font-awesome-icon
              :icon="['fas', 'clipboard']"
              size="2x"
              class="text-muted mb-2"
            />
            <p class="text-muted mb-0">
              No results yet. Complete an exam to see your results!
            </p>
          </div>
        </template>

        <template #cell(score)="data">
          <b-progress
            :value="data.value"
            max="100"
            height="20px"
            :variant="getScoreVariant(data.value)"
            class="mb-2"
          >
            <b-progress-bar :value="data.value">
              <strong>{{ data.value }}%</strong>
            </b-progress-bar>
          </b-progress>
        </template>

        <template #cell(badge)="data">
          
          <b-badge :variant="getBadgeVariant(data.value)" class="p-2">
            <font-awesome-icon :icon="['fas', 'medal']" class="mr-1" />
            {{ data.value }}
          </b-badge>
        </template>

        <template #cell(action)="data">
          <b-button
            size="sm"
            variant="outline-primary"
            @click="viewDetailedResult(data.item)"
          >
            <font-awesome-icon :icon="['fas', 'eye']" class="mr-1" />
            Details
          </b-button>
        </template>
      </b-table>
    </b-card>

    <!-- Performance Overview -->
    <b-row>
      <b-col md="6">
        <b-card class="mb-4 h-100">
          <h4 class="h5 mb-3">
            <font-awesome-icon :icon="['fas', 'award']" class="mr-2" />
            Badges Earned
          </h4>
          <div v-if="badges.length" class="badges-container">
            <b-badge
              v-for="badge in badges"
              :key="badge.name"
              :variant="badge.variant"
              class="p-2 mr-2 mb-2"
              style="font-size: 0.9rem"
            >
              <font-awesome-icon :icon="['fas', 'medal']" class="mr-1" />
              {{ badge.name }}
            </b-badge>
          </div>
          <p v-else class="text-muted mb-0">Complete exams to earn badges!</p>
        </b-card>
      </b-col>

      <b-col md="6">
        <b-card class="mb-4 h-100">
          <h4 class="h5 mb-3">
            <font-awesome-icon :icon="['fas', 'clock']" class="mr-2" />
            Upcoming Exams
          </h4>
          <div v-if="upcomingExams.length">
            <div
              v-for="exam in upcomingExams"
              :key="exam.id"
              class="mb-3 p-2 border rounded"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ exam.title }}</strong>
                  <br />
                  <small class="text-muted">
                    <font-awesome-icon
                      :icon="['fas', 'calendar']"
                      class="mr-1"
                    />
                    {{ formatDate(exam.startDate) }}
                  </small>
                </div>
                <b-badge variant="info">Scheduled</b-badge>
              </div>
            </div>
          </div>
          <p v-else class="text-muted mb-0">No upcoming exams</p>
        </b-card>
      </b-col>
    </b-row>

    <!-- Exam Modal -->
    <b-modal
      v-model="showExamModal"
      :title="currentExam.title"
      size="xl"
      hide-footer
      @hidden="resetExam"
      no-close-on-esc
      no-close-on-backdrop
    >
      <div v-if="!examCompleted">
        <!-- Exam Instructions -->
        <b-alert show variant="info" class="mb-3">
          <div class="d-flex align-items-center">
            <font-awesome-icon
              :icon="['fas', 'shield-alt']"
              size="lg"
              class="mr-3"
            />
            <div>
              <strong>Secure Exam Mode Active</strong><br />
              <small
                >Fullscreen enabled | Tab switching will be detected |
                Copy/Paste disabled</small
              >
            </div>
          </div>
        </b-alert>

        <!-- Timer -->
        <div class="timer mb-3 p-3 bg-light text-center rounded">
          <h4 class="mb-0">
            Time Remaining:
            <span
              :class="{
                'text-danger': timeRemaining < 300,
                'font-weight-bold': true,
              }"
            >
              {{ formatTime(timeRemaining) }}
            </span>
          </h4>
        </div>

        <!-- Progress -->
        <div class="mb-3">
          <small class="text-muted"
            >Progress: {{ answeredCount }}/{{ totalQuestions }} questions</small
          >
          <b-progress
            :value="answeredCount"
            :max="totalQuestions"
            class="mt-1"
          ></b-progress>
        </div>

        <!-- Questions -->
        <div class="questions-container p-3 border rounded">
          <div
            v-for="(question, index) in currentExam.questions"
            :key="index"
            class="mb-4"
          >
            <p class="font-weight-bold mb-2">
              {{ index + 1 }}. {{ question.text }}
            </p>
            <b-form-radio-group
              v-model="answers[index]"
              :options="question.options"
              stacked
              class="ml-3"
            ></b-form-radio-group>
            <hr v-if="index < currentExam.questions.length - 1" class="my-3" />
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

      <!-- Exam Results -->
      <div v-else class="text-center">
        <font-awesome-icon
          :icon="['fas', 'check-circle']"
          size="4x"
          class="text-success mb-3"
        />
        <h3>Exam Completed Successfully!</h3>

        <b-card class="mt-4">
          <b-row>
            <b-col md="4">
              <h6 class="text-muted">Your Score</h6>
              <p class="h2 text-primary">{{ examResult.score }}%</p>
            </b-col>
            <b-col md="4">
              <h6 class="text-muted">Badge Earned</h6>
              <b-badge
                :variant="getBadgeVariant(examResult.badge)"
                class="p-3"
                style="font-size: 1rem"
              >
                <font-awesome-icon :icon="['fas', 'medal']" class="mr-1" />
                {{ examResult.badge }}
              </b-badge>
            </b-col>
            <b-col md="4">
              <h6 class="text-muted">Time Taken</h6>
              <p class="h4">{{ examResult.timeTaken }}</p>
            </b-col>
          </b-row>
        </b-card>

        <div class="mt-4">
          <b-button variant="primary" @click="shareResult">
            <font-awesome-icon :icon="['fas', 'share-alt']" class="mr-2" />
            Share Result
          </b-button>
          <b-button
            variant="outline-secondary"
            @click="showExamModal = false"
            class="ml-2"
          >
            Close
          </b-button>
        </div>
      </div>
    </b-modal>

    <!-- Footer -->
    <footer class="text-center text-muted py-3">
      <small>© 2026 DevMasterMind | All rights reserved</small>
    </footer>
  </div>
</template>

<script>
export default {
  name: "SeekerDashboard",
  data() {
    return {
      currentUser: {},
      examSearch: "",
      showExamModal: false,
      currentExam: {},
      answers: [],
      examCompleted: false,
      examResult: {},
      timeRemaining: 0,
      timerInterval: null,
      syncing: false,
      stats: {
        availableExams: 0,
        completed: 0,
        averageScore: 0,
      },
      availableExamFields: [
        { key: "title", label: "Exam Title" },
        { key: "role", label: "Position" },
        { key: "duration", label: "Duration (min)" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "studentsCount", label: "Candidates" },
        { key: "status", label: "Status" },
        { key: "action", label: "" },
      ],
      resultFields: [
        { key: "examTitle", label: "Exam" },
        { key: "date", label: "Date" },
        { key: "score", label: "Score" },
        { key: "badge", label: "Achievement" },
        { key: "action", label: "" },
      ],
      availableExams: [],
      myResults: [],
      badges: [],
      startedExams: new Set(),
    };
  },
  computed: {
    filteredAvailableExams() {
      if (!this.examSearch) return this.availableExams;
      return this.availableExams.filter(
        (exam) =>
          exam.title.toLowerCase().includes(this.examSearch.toLowerCase()) ||
          exam.role.toLowerCase().includes(this.examSearch.toLowerCase()),
      );
    },
    upcomingExams() {
      return this.availableExams.filter((exam) => exam.status === "Scheduled");
    },
    totalQuestions() {
      return this.currentExam.questions?.length || 0;
    },
    answeredCount() {
      return this.answers.filter((a) => a !== null && a !== undefined).length;
    },
  },
  created() {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
      email: "student@example.com",
      name: "Student User",
    };

    if (!this.currentUser) {
      this.$router.push("/");
    }

    this.loadUserResults().then(() => {
      this.loadCompanyExams();
    });

    setInterval(() => {
      this.refreshExams();
    }, 30000);
  },
  beforeDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== "row") return "";

      if (item.alreadyCompleted) {
        return "completed-exam-row";
      }
      if (item.companyCompleted) {
        return "locked-exam-row";
      }
      if (item.status === "Expired") {
        return "expired-exam-row";
      }
      if (item.status === "Scheduled") {
        return "upcoming-exam-row";
      }
      return "";
    },

    logout() {
      localStorage.removeItem("currentUser");
      this.$router.push("/");
      this.$bvToast.toast("Logged out successfully", {
        title: "Success",
        variant: "success",
      });
    },

    loadCompanyExams() {
      const companyExams =
        JSON.parse(localStorage.getItem("devmaster_exams")) || [];

      this.availableExams = companyExams.map((exam) => {
        const now = new Date();
        const start = new Date(exam.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(exam.endDate);
        end.setHours(23, 59, 59, 999);

        const alreadyCompleted = this.myResults.some(
          (r) => r.examTitle === exam.title,
        );

        const companyCompleted =
          exam.manuallyCompleted === true || exam.status === "Completed";

        let status = "Scheduled";
        let statusMessage = "";
        let disabled = false;
        let disabledReason = "";

        if (alreadyCompleted) {
          status = "Completed";
          statusMessage = "Completed";
          disabled = true;
          disabledReason = "You have already completed this exam";
        } else if (companyCompleted) {
          status = "Locked";
          statusMessage = "Exam Closed";
          disabled = true;
          disabledReason = "This exam has been closed by the company";
        } else if (now >= start && now <= end) {
          status = "Active";
          statusMessage = "Available Now";
          disabled = false;
        } else if (now > end) {
          status = "Expired";
          statusMessage = "Expired";
          disabled = true;
          disabledReason = "Exam deadline has passed";
        } else {
          status = "Scheduled";
          statusMessage = "Upcoming";
          disabled = true;
          disabledReason = "Exam not started yet";
        }

        return {
          id: exam.id,
          title: exam.title,
          role: exam.role,
          duration: 60,
          startDate: this.formatDate(exam.startDate),
          endDate: this.formatDate(exam.endDate),
          studentsCount: exam.studentsCount || 0,
          status: status,
          statusMessage: statusMessage,
          disabled: disabled,
          disabledReason: disabledReason,
          alreadyCompleted: alreadyCompleted,
          companyCompleted: companyCompleted,
          questions: [],
        };
      });

      this.stats.availableExams = this.availableExams.filter(
        (e) => e.status === "Active" && !e.disabled,
      ).length;

      this.syncing = false;
    },

    loadUserResults() {
      return new Promise((resolve) => {
        const userEmail =
          this.currentUser.email?.replace(/[.@]/g, "_") || "default";
        const savedResults = localStorage.getItem(
          `student_results_${userEmail}`,
        );

        if (savedResults) {
          this.myResults = JSON.parse(savedResults);
          this.updateBadgesAndStats();
        } else {
          this.myResults = [];
          this.stats.completed = 0;
          this.stats.averageScore = 0;
          this.badges = [];
        }
        resolve();
      });
    },

    updateBadgesAndStats() {
      this.stats.completed = this.myResults.length;

      if (this.myResults.length > 0) {
        const totalScore = this.myResults.reduce((sum, r) => sum + r.score, 0);
        this.stats.averageScore = Math.round(
          totalScore / this.myResults.length,
        );
      }

      const badgeMap = {};
      this.myResults.forEach((result) => {
        if (!badgeMap[result.badge]) {
          badgeMap[result.badge] = 1;
        } else {
          badgeMap[result.badge]++;
        }
      });

      this.badges = Object.keys(badgeMap).map((badge) => ({
        name: badge,
        variant: this.getBadgeVariant(badge),
      }));
    },

    async getExamQuestions(title, role) {
      try {
        let jsonFile = "";
        if (role === "Fresher" || role === "CS Graduate") {
          jsonFile = "/exams/fresher.json";
        } else if (role === "Frontend Developer") {
          jsonFile = "/exams/frontend.json";
        } else if (role === "Backend Developer") {
          jsonFile = "/exams/backend.json";
        } else {
          jsonFile = "/exams/fresher.json";
        }

        const response = await fetch(jsonFile);
        const data = await response.json();

        return data.questions;
      } catch (error) {
        console.error("Error loading exam questions:", error);

        this.$bvToast.toast(
          "Failed to load exam questions. Please try again.",
          {
            title: "Error",
            variant: "danger",
            solid: true,
          },
        );

        return [];
      }
    },

    refreshExams() {
      this.syncing = true;
      this.loadUserResults().then(() => {
        this.loadCompanyExams();
        this.$bvToast.toast("Exams list updated!", {
          title: "Synced",
          variant: "info",
          solid: true,
        });
      });
    },

    async startExam(exam) {
      if (this.isExamStarted(exam.id)) {
        this.$bvToast.toast("This exam is already in progress!", {
          title: "Cannot Start",
          variant: "warning",
          solid: true,
        });
        return;
      }
      const alreadyCompleted = this.myResults.some(
        (r) => r.examTitle === exam.title,
      );

      if (alreadyCompleted) {
        this.$bvToast.toast(
          "You have already completed this exam. One attempt only!",
          {
            title: "Not Allowed",
            variant: "danger",
            solid: true,
          },
        );
        return;
      }

      const questions = await this.getExamQuestions(exam.title, exam.role);

      if (!questions || questions.length === 0) {
        return;
      }

      exam.questions = questions;

      localStorage.setItem(
        "current_exam",
        JSON.stringify({
          id: exam.id,
          title: exam.title,
          role: exam.role,
          questions: exam.questions,
          duration: exam.duration || 60,
          studentName: this.currentUser.name,
          studentEmail: this.currentUser.email,
        }),
      );

      window.open(
        "/secure-exam.html",
        "_blank",
        "width=1400,height=800,menubar=no,toolbar=no,location=no,status=no",
      );

      this.startedExams.add(exam.id);

      this.$bvToast.toast("Exam opened in secure window!", {
        title: "Success",
        variant: "success",
        solid: true,
      });
    },

    isExamStarted(examId) {
      return this.startedExams.has(examId);
    },

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          this.submitExam();
        }
      }, 1000);
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${mins}m ${secs}s`;
      }
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    submitExam() {
      clearInterval(this.timerInterval);

      const correctAnswers = this.answers.filter((a) => a === "a").length;
      const totalQuestions = this.currentExam.questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      let badge = "Beginner";
      if (score >= 80) badge = "Industry Ready";
      else if (score >= 60) badge = "Strong Junior";
      else if (score >= 40) badge = "Junior Ready";

      const timeTaken = this.formatTime(
        (this.currentExam.duration || 60) * 60 - this.timeRemaining,
      );

      this.examResult = {
        score,
        badge,
        timeTaken,
      };

      this.examCompleted = true;

      const result = {
        id: Date.now(),
        name:
          this.currentUser.name ||
          this.currentUser.email?.split("@")[0] ||
          "Student",
        email: this.currentUser.email,
        examTitle: this.currentExam.title,
        date: new Date().toLocaleDateString(),
        score: score,
        badge: badge,
        submittedAt: new Date().toLocaleString(),
      };

      this.myResults.unshift(result);

      const userEmail =
        this.currentUser.email?.replace(/[.@]/g, "_") || "default";
      localStorage.setItem(
        `student_results_${userEmail}`,
        JSON.stringify(this.myResults),
      );

      this.saveToCentralResults(result);

      this.updateBadgesAndStats();
      this.startedExams.delete(this.currentExam.id);

      this.stats.completed = this.myResults.length;

      this.loadCompanyExams();

      this.$bvToast.toast("Exam submitted successfully!", {
        title: "Success",
        variant: "success",
        solid: true,
      });

      this.showExamModal = false;
    },

    saveToCentralResults(result) {
      let allResults = [];
      const savedResults = localStorage.getItem("all_student_results");

      if (savedResults) {
        allResults = JSON.parse(savedResults);
      }

      allResults.push(result);

      localStorage.setItem("all_student_results", JSON.stringify(allResults));

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "all_student_results",
          newValue: JSON.stringify(allResults),
        }),
      );
    },

    resetExam() {
      clearInterval(this.timerInterval);
      this.currentExam = {};
      this.answers = [];
      this.examCompleted = false;
    },

    viewDetailedResult(result) {
      this.$bvToast.toast(`Score: ${result.score}% }`, {
        title: result.examTitle,
        variant: "info",
        solid: true,
      });
    },

    shareResult() {
      const resultLink = `https://devmastermind.com/result/${
        this.currentUser.email
      }/${Date.now()}`;
      navigator.clipboard.writeText(resultLink);
      this.$bvToast.toast("Result link copied to clipboard!", {
        title: "Success",
        variant: "success",
        solid: true,
      });
    },

    getStatusVariant(status) {
      const variants = {
        Active: "success",
        Scheduled: "info",
        Completed: "secondary",
        Expired: "danger",
      };
      return variants[status] || "light";
    },

    getStatusIcon(status, item = null) {
      if (item?.alreadyCompleted) return ["fas", "check-circle"];
      if (item?.companyCompleted) return ["fas", "lock"];

      const icons = {
        Active: "play-circle",
        Scheduled: "calendar",
        Completed: "check-circle",
        Locked: "lock",
        Expired: "times-circle",
      };
      return ["fas", icons[status] || "circle"];
    },

    getScoreVariant(score) {
      if (score >= 80) return "success";
      if (score >= 60) return "info";
      if (score >= 40) return "warning";
      return "danger";
    },

    getBadgeVariant(badge) {
      const variants = {
        Beginner: "secondary",
        "Junior Ready": "info",
        "Strong Junior": "primary",
        "Industry Ready": "success",
      };
      return variants[badge] || "light";
    },
  },
};
</script>

<style scoped>
.dashboard-header {
  background: white;
  border-bottom: 1px solid #eef0f3;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seeker-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafd;
  min-height: 100vh;
}
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.logout-btn {
  white-space: nowrap;
}

.profile-icon {
  color: #0d6efd;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef0f3;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.bg-primary-soft {
  background: #eef2ff;
}
.bg-success-soft {
  background: #ecfdf3;
}
.bg-warning-soft {
  background: #fffbeb;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.stat-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
  padding: 1.5rem 1rem;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.timer {
  font-size: 1.2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.questions-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

::v-deep .progress {
  height: 20px;
  border-radius: 10px;
  background-color: #e9ecef;
}

::v-deep .progress-bar {
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

::v-deep .table {
  margin-bottom: 0;
}

::v-deep .table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

::v-deep .table tbody tr:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

::v-deep .card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s;
}

::v-deep .card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.badge {
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 30px;
}

.fa-spin {
  animation: fa-spin 2s linear infinite;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .seeker-dashboard {
    padding: 10px !important;
  }

  .d-flex.justify-content-between.align-items-center {
    flex-direction: column;
    gap: 10px;
  }

  .w-25 {
    width: 100% !important;
    margin-top: 10px;
  }

  .questions-container {
    max-height: 400px;
  }
}

.completed-exam-row {
  opacity: 0.6;
  background-color: #f0f9f0 !important;
  position: relative;
}

.completed-exam-row td {
  position: relative;
}

.completed-exam-row::after {
  content: "✓ Completed";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #28a745;
  font-size: 0.7rem;
  font-weight: bold;
  background: rgba(40, 167, 69, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  pointer-events: none;
}

.locked-exam-row {
  opacity: 0.5;
  background-color: #f8f9fa !important;
  position: relative;
}

.locked-exam-row td {
  position: relative;
}

.locked-exam-row::after {
  content: "🔒 Closed";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.7rem;
  font-weight: bold;
  background: rgba(108, 117, 125, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  pointer-events: none;
}

.expired-exam-row {
  opacity: 0.5;
  background-color: #fff5f5 !important;
  position: relative;
}

.expired-exam-row td {
  position: relative;
}

.expired-exam-row::after {
  content: "⏰ Expired";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #dc3545;
  font-size: 0.7rem;
  font-weight: bold;
  background: rgba(220, 53, 69, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  pointer-events: none;
}

.upcoming-exam-row {
  opacity: 0.7;
  background-color: #fff3e0 !important;
}

.upcoming-exam-row td {
  position: relative;
}

.status-badge-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

button:disabled {
  cursor: not-allowed;
}

.opacity-50 {
  opacity: 0.6;
}

[title] {
  cursor: help;
}

.status-badge.status-completed {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.status-badge.status-locked {
  background: #eeeeee;
  color: #616161;
  border: 1px dashed #9e9e9e;
}

.status-badge.status-expired {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.available-badge {
  background-color: #f51027;
  color: white;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.pulse {
  animation: pulseGlow 1.6s infinite;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(167, 40, 53, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}
</style>
