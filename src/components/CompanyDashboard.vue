<template>
  <div class="company-dashboard">
    <div
      class="dashboard-header d-flex align-items-center justify-content-between mb-4"
    >
      <div>
        <h1 class="h3 mb-1">Company Dashboard</h1>
        <p class="text-muted mb-0 d-flex align-items-center gap-2">
          <font-awesome-icon icon="building" class="me-1" />
          <span class="ml-2">DevMasterMind · Recruitment Hub</span>
        </p>
      </div>

      <b-button
        variant="danger"
        class="btn-logout-pill d-flex align-items-center"
        @click="handleLogout"
      >
        <font-awesome-icon icon="sign-out-alt" class="me-1" />
        Logout
      </b-button>
    </div>

    <!-- Dynamic Metrics Cards -->
    <div class="row metrics-grid mb-4">
      <div
        class="col-md-3 col-6 mb-3"
        v-for="metric in metrics"
        :key="metric.title"
      >
        <div class="metric-card">
          <div class="metric-icon" :class="metric.iconClass">
            <font-awesome-icon :icon="metric.icon" />
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ metric.title }}</span>
            <span class="metric-value">{{ metric.value }}</span>
            <small v-if="metric.subtext" class="metric-subtext">{{
              metric.subtext
            }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Panel -->
    <div
      class="actions-panel d-flex flex-wrap align-items-center justify-content-between mb-4"
    >
      <b-button
        variant="primary"
        class="btn-generate"
        @click="openGenerateModal"
      >
        <font-awesome-icon icon="plus-circle" class="mr-2" /> Generate Exam Link
      </b-button>
      <div class="security-notice">
        <font-awesome-icon icon="shield-alt" class="mr-2" />
        <span
          ><strong>Exam Security:</strong> Tab switch detection · Fullscreen
          enforced · Clipboard locked</span
        >
      </div>
    </div>

    <!-- Scheduled Exams Table -->
    <b-card class="dashboard-table mb-4" no-body>
      <div class="table-header">
        <h5 class="mb-0">
          <font-awesome-icon icon="list-alt" class="mr-2" /> Scheduled
          Examinations
        </h5>
      </div>
      <div class="table-responsive">
        <b-table hover :items="sortedExams" :fields="examFields" responsive>
          <template #cell(status)="data">
            <span :class="['status-badge', getStatusClass(data.item.status)]">
              <font-awesome-icon
                :icon="getStatusIcon(data.item.status)"
                class="mr-1"
              />
              {{ getStatusText(data.item.status) }}
            </span>
          </template>
          <template #cell(scope)="data">
            <span
              :class="[
                'scope-badge',
                data.item.scope === 'public'
                  ? 'scope-public'
                  : 'scope-shortlisted',
              ]"
            >
              <font-awesome-icon
                :icon="data.item.scope === 'public' ? 'globe' : 'users'"
                class="mr-1"
              />
              {{
                data.item.scope === "public" ? "Public Access" : "Invite Only"
              }}
            </span>
          </template>
          <template #cell(studentsCount)="data">
            <div class="candidate-indicator">
              <font-awesome-icon
                :icon="
                  data.item.studentsCount > 0 ? 'user-check' : 'user-clock'
                "
                class="mr-1"
              />
              {{ data.item.studentsCount }}
              {{ data.item.studentsCount === 1 ? "Candidate" : "Candidates" }}
            </div>
          </template>

          <template #cell(actions)="data">
            <div class="action-icons d-flex align-items-center gap-2">
              <font-awesome-icon
                v-if="data.item.hasResults"
                :icon="['fas', 'check-circle']"
                class="action-icon text-success"
                title="Results available"
              />
              <font-awesome-icon
                v-else
                :icon="['fas', 'times-circle']"
                class="action-icon text-danger"
                title="No results yet"
              />

              <b-button
                variant="success"
                size="sm"
                class="p-1 d-flex align-items-center justify-content-center"
                :disabled="data.item.status === 'Completed'"
                @click="markCompleted(data.item.id)"
                title="Mark as Completed"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </b-button>

              <b-button
                variant="danger"
                size="sm"
                class="p-1 d-flex align-items-center justify-content-center"
                @click="deleteExam(data.item.id)"
                title="Delete exam"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </b-button>
            </div>
          </template>
        </b-table>
      </div>
      <div v-if="exams.length === 0" class="empty-state">
        <p class="text-muted mb-0">
          No exams scheduled. Create your first exam to get started.
        </p>
      </div>
    </b-card>

    <!-- Student Results Table -->
    <b-card class="dashboard-table mb-4" no-body>
      <div
        class="table-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <font-awesome-icon icon="user-graduate" class="mr-2" /> Student
          Results
          <b-badge variant="primary" class="ml-2">{{ results.length }}</b-badge>
        </h5>
        <div>
          <b-button
            size="sm"
            variant="outline-primary"
            @click="refreshResults"
            class="mr-2"
          >
            <font-awesome-icon :icon="['fas', 'sync']" :spin="syncing" />
            Refresh
          </b-button>
        </div>
      </div>
      <div class="table-responsive">
        <b-table hover :items="results" :fields="resultFields" responsive>
          <template #cell(name)="data">
            <div class="student-info">
              <font-awesome-icon icon="user-circle" class="mr-1" />
              {{ data.item.name }}
            </div>
          </template>

          <template #cell(email)="data">
            <small>
              <font-awesome-icon
                :icon="['fas', 'envelope']"
                class="mr-1 text-muted"
              />
              {{ data.item.email }}
            </small>
          </template>

          <template #cell(score)="data">
            <div class="d-flex align-items-center">
              <b-progress
                :value="data.item.score"
                max="100"
                height="8px"
                :variant="getScoreVariant(data.item.score)"
                class="flex-grow-1 mr-2"
                style="width: 60px"
              ></b-progress>
              <strong>{{ data.item.score }}%</strong>
            </div>
          </template>

          <template #cell(badge)="data">
            <span :class="['level-badge', getLevelClass(data.item.badge)]">
              <font-awesome-icon :icon="['fas', 'medal']" class="mr-1" />
              {{ data.item.badge }}
            </span>
          </template>

          <template #cell(submittedAt)="data">
            <small class="text-muted">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-1" />
              {{ data.item.submittedAt || data.item.date }}
            </small>
          </template>
        </b-table>
      </div>
      <div v-if="results.length === 0" class="empty-state">
        <font-awesome-icon
          :icon="['fas', 'inbox']"
          size="2x"
          class="text-muted mb-2"
        />
        <p class="text-muted mb-0">
          No results available yet. Results will appear here in real-time when
          students complete exams.
        </p>
      </div>
    </b-card>

    <!-- Generate Exam Modal -->
    <b-modal
      id="generateModal"
      ref="generateModal"
      title="Generate Exam Link"
      centered
      hide-footer
    >
      <div class="modal-content-wrapper">
        <b-form-group label="Exam Type *" label-class="font-weight-bold">
          <b-form-select v-model="form.examType" :options="examTypes" />
        </b-form-group>

        <b-form-group label="Experience Level" label-class="font-weight-bold">
          <b-form-select
            v-model="form.experience"
            :options="experienceOptions"
          />
        </b-form-group>

        <b-form-group label="Exam Title" label-class="font-weight-bold">
          <b-form-input
            v-model="form.customTitle"
            placeholder="e.g., Laravel Backend L1"
          />
        </b-form-group>

        <b-row>
          <b-col cols="6">
            <b-form-group label="Start Date" label-class="font-weight-bold">
              <b-form-input
                type="date"
                v-model="form.date"
                :min="currentDateISO"
              />
            </b-form-group>
          </b-col>
          <b-col cols="6">
            <b-form-group label="End Date" label-class="font-weight-bold">
              <b-form-input
                type="date"
                v-model="form.endDate"
                :min="form.date"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group label="Visibility" label-class="font-weight-bold">
          <b-form-radio-group v-model="form.scope" class="mt-2">
            <b-form-radio value="public" class="mr-4"
              >Public Link (Anyone with link)</b-form-radio
            >
            <b-form-radio value="shortlist">Private (Invite only)</b-form-radio>
          </b-form-radio-group>
        </b-form-group>

        <div v-if="generatedLink" class="generated-link">
          <code class="link-text">{{ generatedLink }}</code>
          <b-button
            size="sm"
            variant="outline-primary"
            @click="copyToClipboard(generatedLink)"
          >
            <font-awesome-icon icon="copy" /> Copy
          </b-button>
        </div>

        <div class="modal-actions">
          <b-button variant="outline-secondary" @click="closeModal"
            >Cancel</b-button
          >
          <b-button variant="primary" @click="scheduleExam"
            >Schedule Exam</b-button
          >
        </div>
      </div>
    </b-modal>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <small>© 2026 DevMasterMind | All rights reserved</small>
    </footer>
  </div>
</template>

<script>
export default {
  name: "CompanyDashboard",
  data() {
    return {
      syncing: false,
      currentDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        weekday: "short",
      }),

      exams: [],
      results: [],
      refreshInterval: null,

      form: {
        examType: "",
        experience: "0–1 years",
        customTitle: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        time: "14:00",
        scope: "public",
      },

      generatedLink: "",
      sortKey: "dateTime",
      sortAsc: true,

      examTypes: [
        { value: "", text: "— Select Assessment —" },
        {
          value: "CS Students Level-1 Assessment – Fresh Graduate",
          text: "CS Students Level-1 – Fresh Graduate",
        },
        {
          value: "Frontend Developer Assessment",
          text: "Frontend Developer Assessment",
        },
        {
          value: "Backend Developer Assessment",
          text: "Backend Developer Assessment",
        },
      ],

      experienceOptions: ["0–1 years", "1–2 years", "2–4 years", "4+ years"],

      examFields: [
        { key: "title", label: "Exam Title", sortable: true },
        { key: "role", label: "Position", sortable: true },
        { key: "dateTime", label: "Scheduled Date & Time", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "studentsCount", label: "Candidates", sortable: true },
        { key: "scope", label: "Access Type" },
        { key: "actions", label: "Actions" },
      ],

      resultFields: [
        { key: "name", label: "Student Name" },
        { key: "email", label: "Email" },
        { key: "examTitle", label: "Exam Title" },
        { key: "score", label: "Score (%)" },
        { key: "badge", label: "Achieved Level" },
        { key: "submittedAt", label: "Submitted" },
      ],
    };
  },

  computed: {
    today() {
      return new Date().toISOString().split("T")[0];
    },

    metrics() {
      const activeExams = this.exams.filter(
        (e) => e.status === "Active" || e.status === "In Progress",
      ).length;

      const completedExams = this.exams.filter(
        (e) => e.status === "Completed" || e.manuallyCompleted === true,
      ).length;

      const uniqueStudents = new Set(this.results.map((r) => r.email)).size;

      const passedStudents = this.results.filter((r) => r.score >= 40).length;
      const passRate =
        this.results.length > 0
          ? Math.round((passedStudents / this.results.length) * 100)
          : 0;

      return [
        {
          title: "Total Exams",
          value: this.exams.length,
          subtext: "Created assessments",
          icon: "calendar-check",
          iconClass: "metric-blue",
        },
        {
          title: "Active Exams",
          value: activeExams,
          subtext: "Currently running",
          icon: ["fas", "play"],
          iconClass: "metric-green",
        },
        {
          title: "Total Students",
          value: uniqueStudents,
          subtext: "Participated",
          icon: "users",
          iconClass: "metric-orange",
        },
        {
          title: "Completed Exams",
          value: completedExams,
          subtext: "Finished & locked",
          icon: "check-double",
          iconClass: "metric-purple",
        },
      ];
    },

    sortedExams() {
      const now = new Date();

      this.exams.forEach((exam) => {
        const start = new Date(exam.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(exam.endDate);
        end.setHours(23, 59, 59, 999);

        const hasResults = this.results.some((r) => r.examTitle === exam.title);

        const actualStudents = this.results.filter(
          (r) => r.examTitle === exam.title,
        ).length;
        exam.studentsCount = actualStudents || exam.studentsCount;

        if (exam.manuallyCompleted) {
          exam.status = "Completed";
        } else if (now >= start && now <= end) {
          exam.status = "Active";
        } else if (now > end) {
          exam.status = hasResults ? "Completed" : "Expired";
        } else {
          exam.status = "Scheduled";
        }

        exam.hasResults = hasResults;
      });

      const sorted = this.exams.slice().sort((a, b) => {
        let va = a[this.sortKey];
        let vb = b[this.sortKey];

        if (this.sortKey === "dateTime") {
          const aDate = new Date(a.dateTime?.replace(" ", "T") || a.startDate);
          const bDate = new Date(b.dateTime?.replace(" ", "T") || b.startDate);
          va = aDate;
          vb = bDate;
        }

        if (va < vb) return this.sortAsc ? -1 : 1;
        if (va > vb) return this.sortAsc ? 1 : -1;
        return 0;
      });

      return sorted.map((exam) => {
        return {
          ...exam,
          isCompleted:
            exam.status === "Completed" || exam.manuallyCompleted === true,
        };
      });
    },
  },

  methods: {
    getScoreVariant(score) {
      if (score >= 80) return "success";
      if (score >= 60) return "info";
      if (score >= 40) return "warning";
      return "danger";
    },
    markCompleted(id) {
      const exam = this.exams.find((e) => e.id === id);
      if (exam) {
        this.$bvModal
          .msgBoxConfirm(
            `Are you sure you want to mark "${exam.title}" as completed? This will lock the exam and no students will be able to take it.`,
            {
              title: "Confirm Completion",
              size: "sm",
              buttonSize: "sm",
              okVariant: "success",
              okTitle: "YES, Complete",
              cancelTitle: "Cancel",
              footerClass: "p-2",
              hideHeaderClose: false,
              centered: true,
            },
          )
          .then((value) => {
            if (value) {
              exam.status = "Completed";
              exam.manuallyCompleted = true;
              exam.hasResults = true;

              const today = new Date().toISOString().split("T")[0];
              exam.endDate = today;

              this.saveExams();

              this.$bvToast.toast(
                `✅ Exam "${exam.title}" has been permanently completed and locked.`,
                {
                  title: "Success",
                  variant: "success",
                  solid: true,
                  autoHideDelay: 5000,
                },
              );

              this.$forceUpdate();
            }
          })
          .catch((err) => {});
      }
    },

    loadData() {
      const savedExams = localStorage.getItem("devmaster_exams");
      if (savedExams) {
        this.exams = JSON.parse(savedExams);
      } else {
        this.exams = [
          {
            id: "e1",
            title: "Laravel Backend L1",
            role: "Backend Developer",
            startDate: "2026-03-15",
            endDate: "2026-03-15",
            dateTime: "2026-03-15 10:00",
            status: "Completed",
            studentsCount: 0,
            scope: "public",
            hasResults: false,
          },
          {
            id: "e2",
            title: "React Frontend Basics",
            role: "Frontend Developer",
            startDate: "2026-03-16",
            endDate: "2026-03-18",
            dateTime: "2026-03-16 14:00",
            status: "Active",
            studentsCount: 0,
            scope: "shortlist",
            hasResults: false,
          },
        ];
      }
      this.loadAllStudentResults();
    },

    loadAllStudentResults() {
      this.results = [];

      console.log("Loading student results...");

      const centralResults = localStorage.getItem("all_student_results");
      if (centralResults) {
        try {
          const results = JSON.parse(centralResults);
          if (Array.isArray(results)) {
            this.results = results;
            console.log(
              "Loaded from central store:",
              results.length,
              "results",
            );
          }
        } catch (e) {
          console.error("Error parsing central results:", e);
        }
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith("student_results_")) {
          try {
            const studentResults = JSON.parse(localStorage.getItem(key));

            if (Array.isArray(studentResults)) {
              studentResults.forEach((result) => {
                const exists = this.results.some(
                  (r) =>
                    r.id === result.id ||
                    (r.email === result.email &&
                      r.examTitle === result.examTitle &&
                      r.date === result.date),
                );

                if (!exists && result.email) {
                  this.results.push({
                    id: result.id || Date.now(),
                    name:
                      result.name || result.email?.split("@")[0] || "Student",
                    email: result.email,
                    examTitle: result.examTitle || "Unknown Exam",
                    score: result.score || 0,
                    badge: result.badge || "Beginner",
                    submittedAt:
                      result.submittedAt ||
                      result.date ||
                      new Date().toLocaleDateString(),
                  });
                }
              });
            }
          } catch (e) {
            console.error("Error parsing student results:", e);
          }
        }
      }

      const uniqueResults = [];
      const seen = new Set();

      this.results.forEach((result) => {
        const key = `${result.email}-${result.examTitle}-${result.date}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(result);
        }
      });

      this.results = uniqueResults;

      this.results.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.date);
        const dateB = new Date(b.submittedAt || b.date);
        return dateB - dateA;
      });

      console.log("Final results loaded:", this.results.length);
      this.saveResults();
      this.updateExamStudentCounts();
      this.$forceUpdate();
    },

    updateExamStudentCounts() {
      this.exams.forEach((exam) => {
        const examResults = this.results.filter(
          (r) => r.examTitle === exam.title,
        );
        exam.studentsCount = examResults.length;
        exam.hasResults = examResults.length > 0;
      });
      this.saveExams();
    },

    getStatusText(status) {
      const statusMap = {
        Completed: "Exam Completed",
        Active: "Active Now",
        Scheduled: "Upcoming",
        Expired: "Expired - No Results",
        Pending: "Awaiting Start",
      };
      return statusMap[status] || status;
    },

    getStatusIcon(status) {
      const iconMap = {
        Completed: "check-circle",
        Active: "play-circle",
        Scheduled: "calendar-alt",
        Expired: "exclamation-circle",
        Pending: "hourglass-half",
      };
      return iconMap[status] || "circle";
    },

    getStatusClass(status) {
      return (
        {
          Completed: "status-completed",
          Active: "status-active",
          Scheduled: "status-scheduled",
          Expired: "status-expired",
          Pending: "status-pending",
        }[status] || "status-default"
      );
    },

    getLevelClass(level) {
      return (
        {
          Beginner: "level-beginner",
          "Junior Ready": "level-junior",
          "Strong Junior": "level-strong",
          "Industry Ready": "level-industry",
        }[level] || "level-beginner"
      );
    },

    openGenerateModal() {
      this.generatedLink = "";
      this.form = {
        examType: "",
        experience: "0–1 years",
        customTitle: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        time: "14:00",
        scope: "public",
      };
      this.$refs.generateModal.show();
    },

    closeModal() {
      if (this.$refs.generateModal) {
        this.$refs.generateModal.hide();
      }
    },

    scheduleExam() {
      if (!this.form.examType) {
        alert("Please select an exam type");
        return;
      }

      const title =
        this.form.customTitle ||
        `${this.form.examType.split("–")[0]} ${this.form.experience}`;

      const dateTimeStr = `${this.form.startDate} ${this.form.time}`;
      const newId = crypto.randomUUID
        ? crypto.randomUUID()
        : `exam-${Date.now()}-${Math.random()}`;

      const now = new Date();
      const startDate = new Date(this.form.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(this.form.endDate);
      endDate.setHours(23, 59, 59, 999);

      let status = "Scheduled";
      if (now >= startDate && now <= endDate) {
        status = "Active";
      } else if (now > endDate) {
        status = "Expired";
      }

      const newExam = {
        id: newId,
        title: title.trim(),
        role: this.getRoleFromExamType(this.form.examType),
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        dateTime: dateTimeStr,
        time: this.form.time,
        status: status,
        studentsCount: 0,
        scope: this.form.scope,
        hasResults: false,
      };

      this.exams.push(newExam);
      this.saveExams();
      this.generatedLink = `https://devmastermind.com/exam/${newId.slice(
        0,
        8,
      )}`;

      this.closeModal();

      this.$bvToast.toast("Exam scheduled successfully!", {
        title: "Success",
        variant: "success",
        solid: true,
      });
    },

    getRoleFromExamType(examType) {
      if (examType.includes("CS")) return "CS Graduate";
      if (examType.includes("Frontend")) return "Frontend Developer";
      if (examType.includes("Backend")) return "Backend Developer";
      return "Developer";
    },

    deleteExam(id) {
      if (confirm("Are you sure you want to delete this exam?")) {
        this.exams = this.exams.filter((e) => e.id !== id);
        this.saveExams();
        this.$bvToast.toast("Exam deleted successfully!", {
          title: "Success",
          variant: "success",
          solid: true,
        });
      }
    },

    saveExams() {
      localStorage.setItem("devmaster_exams", JSON.stringify(this.exams));
    },

    saveResults() {
      localStorage.setItem("devmaster_results", JSON.stringify(this.results));
    },

    copyToClipboard(text) {
      navigator.clipboard
        ?.writeText(text)
        .then(() => {
          this.$bvToast.toast("Link copied to clipboard!", {
            title: "Success",
            variant: "success",
            solid: true,
          });
        })
        .catch(() => prompt("Copy manually:", text));
    },

    copyResultLink(result) {
      const resultLink = `https://devmastermind.com/result/${result.email}/${result.id}`;
      this.copyToClipboard(resultLink);
    },

    handleLogout() {
      localStorage.removeItem("currentUser");
      this.$router.push("/");
    },

    refreshResults() {
      this.loadAllStudentResults();
      this.$bvToast.toast("Results updated in real-time!", {
        title: "Sync Complete",
        variant: "info",
        solid: true,
      });
    },

    exportResults() {
      // Convert results to CSV
      const headers = [
        "Student Name",
        "Email",
        "Exam Title",
        "Score",
        "Badge",
        "Submitted",
      ];
      const csvData = this.results.map((r) => [
        r.name,
        r.email,
        r.examTitle,
        r.score + "%",
        r.badge,
        r.submittedAt,
      ]);

      const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");

      // Download CSV
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student-results-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();

      this.$bvToast.toast("Results exported successfully!", {
        title: "Export Complete",
        variant: "success",
        solid: true,
      });
    },
  },

  mounted() {
    this.loadData();
    window.addEventListener("storage", (e) => {
      if (e.key === "devmaster_exams") {
        this.exams = JSON.parse(e.newValue) || this.exams;
      }
      if (e.key && e.key.startsWith("student_results_")) {
        this.loadAllStudentResults();
      }
    });

    this.refreshInterval = setInterval(() => {
      this.loadAllStudentResults();
    }, 10000);

    setInterval(() => {
      this.$forceUpdate();
    }, 60000);
  },

  beforeDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
};
</script>

<style scoped>
.company-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafd;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.dashboard-header {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.dashboard-header h1 {
  color: #1a2b3e;
  font-weight: 600;
  margin: 0;
}

.btn-logout-pill {
  border-radius: 40px;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.metric-blue {
  background: #e8f0fe;
  color: #1a4cbc;
}
.metric-green {
  background: #e3f5ec;
  color: #0f6e4a;
}
.metric-orange {
  background: #fff0e0;
  color: #b45b0f;
}
.metric-purple {
  background: #edeaf9;
  color: #5e4a9e;
}

.metric-content {
  flex: 1;
}

.metric-label {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.metric-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.metric-subtext {
  font-size: 0.8rem;
  color: #94a3b8;
}

.actions-panel {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.btn-generate {
  background: #1a2b3e;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 40px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.btn-generate:hover {
  background: #0f1e2e;
}

.security-notice {
  color: #475569;
  font-size: 0.9rem;
  background: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 40px;
}

.security-notice strong {
  color: #1e293b;
}

/* Tables */
.dashboard-table {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.table-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9edf2;
  background: white;
}

.table-header h5 {
  color: #1a2b3e;
  font-weight: 600;
}

.table-responsive {
  background: white;
}

::v-deep .table {
  margin: 0;
}

::v-deep .table thead th {
  background: #f8fafd;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
}

::v-deep .table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  color: #1e293b;
  border-bottom: 1px solid #edf2f7;
}

::v-deep .table tbody tr:hover {
  background: #fafcff;
}

.status-badge {
  padding: 0.35rem 1rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.status-active {
  background: #e3f5ec;
  color: #0f6e4a;
}

.status-today {
  background: #fff3cd;
  color: #856404;
}

.status-scheduled {
  background: #e8f0fe;
  color: #1a4cbc;
}

.status-pending {
  background: #fff0e0;
  color: #b45b0f;
}

.status-completed {
  background: #e9edf2;
  color: #475569;
}

.status-expired {
  background: #f8d7da;
  color: #721c24;
}

.scope-badge {
  padding: 0.35rem 1rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.scope-public {
  background: #e8f0fe;
  color: #1a4cbc;
  border: 1px solid #cddfff;
}

.scope-shortlisted {
  background: #edeaf9;
  color: #5e4a9e;
  border: 1px solid #dbd4f0;
}

.level-badge {
  padding: 0.35rem 1rem;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.level-beginner {
  background: #f1f5f9;
  color: #475569;
}

.level-junior {
  background: #e8f0fe;
  color: #1a4cbc;
}

.level-strong {
  background: #e3f5ec;
  color: #0f6e4a;
}

.level-industry {
  background: #edeaf9;
  color: #5e4a9e;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-icon {
  font-size: 1.25rem;
  cursor: default;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 30px;
}

.candidate-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  background: white;
  color: #64748b;
}

.generated-link {
  background: #f1f5f9;
  border-radius: 40px;
  padding: 0.75rem 1rem;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f0;
}

.link-text {
  font-size: 0.85rem;
  color: #1e293b;
  word-break: break-all;
  margin-right: 1rem;
}

.modal-content-wrapper {
  padding: 0.5rem 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.dashboard-footer {
  text-align: center;
  padding: 2rem 0 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .company-dashboard {
    padding: 1rem;
  }

  .metric-card {
    padding: 1rem;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .actions-panel {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start !important;
  }

  .security-notice {
    width: 100%;
    text-align: left;
  }
}

.completed-exam-row {
  opacity: 0.6;
  background-color: #f8f9fa !important;
  position: relative;
}

.completed-exam-row td {
  position: relative;
}

.completed-exam-row::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    #dc3545,
    #dc3545,
    #dc3545,
    transparent
  );
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.5;
}

.completed-exam-row:hover {
  opacity: 0.7 !important;
  background-color: #f1f3f5 !important;
}

.completed-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  font-size: 0.7rem;
  color: #dc3545;
  opacity: 0.8;
}

.status-badge.status-completed {
  background: #e9ecef;
  color: #6c757d;
  border: 1px dashed #adb5bd;
  opacity: 0.8;
}

.completed-exam-row .action-icons button,
.completed-exam-row .action-icons .action-icon {
  opacity: 0.5;
  pointer-events: none;
}

.completed-exam-row .action-icons button.btn-danger {
  opacity: 0.8;
  pointer-events: auto;
}

.completed-exam-row .action-icons button.btn-danger:hover {
  opacity: 1;
  background-color: #dc3545;
}
</style>
