<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <main class="flex-grow-1 d-flex align-items-center">
      <div class="container text-center">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-xl-7">
            <h1 class="display-4 font-weight-bold text-dark mb-4">
              “Unlock Opportunities:<br />
              <span class="text-primary">Fair Skill Assessment</span> for Fresh
              Graduates”
            </h1>

            <!-- Description -->
            <p class="lead text-muted mb-5 mx-auto" style="max-width: 600px">
              A standardized Level‑1 assessment for CS graduates — reduce hiring
              bias and give freshers a fair start.
            </p>

            <div
              class="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4 role-selection-buttons"
            >
              <!-- Job Seeker Button -->
              <b-button
                variant="primary"
                class="role-btn role-btn--primary"
                @click="openModal('seeker')"
              >
                <font-awesome-icon :icon="['fas', 'user-graduate']" />
                <span>Job Seeker</span>
              </b-button>

              <!-- Company Button -->
              <b-button
                variant="outline-primary"
                class="role-btn role-btn--outline"
                @click="openModal('company')"
              >
                <font-awesome-icon :icon="['fas', 'building']" />
                <span>Company</span>
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="text-center py-4 text-muted small">
      <p class="mb-0">© 2026 SkillVerify · DevMasterMind</p>
    </footer>

    <!-- Auth Modal using BootstrapVue -->
    <b-modal
      v-model="showModal"
      :title="modalTitle"
      centered
      hide-footer
      no-close-on-backdrop
      body-class="px-4 py-3"
      header-class="border-bottom-0 pb-0"
    >
      <!-- Role badge -->
      <div class="text-center mb-4">
        <b-badge :variant="roleBadgeVariant" class="px-3 py-2">
          <font-awesome-icon :icon="roleIcon" class="mr-2" />
          {{ roleText }}
        </b-badge>
      </div>

      <!-- Auth Tabs -->
      <b-tabs v-model="tabIndex" justified class="mb-4">
        <!-- Login Tab -->
        <b-tab title="Log in" active>
          <b-form @submit.prevent="handleLogin" class="mt-3">
            <b-form-group
              label="Email address"
              label-for="login-email"
              label-class="font-weight-medium text-muted small"
            >
              <b-form-input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                placeholder="you@example.com"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Password"
              label-for="login-password"
              label-class="font-weight-medium text-muted small"
              class="mt-3"
            >
              <b-form-input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                placeholder="••••••••"
                required
              ></b-form-input>
            </b-form-group>

            <b-button
              type="submit"
              :variant="buttonVariant"
              block
              class="mt-4 py-2 font-weight-semibold"
            >
              Log in to continue
            </b-button>
          </b-form>
        </b-tab>

        <!-- Signup Tab -->
        <b-tab title="Sign up">
          <b-form @submit.prevent="handleSignup" class="mt-3">
            <b-form-group
              label="Full name"
              label-for="signup-name"
              label-class="font-weight-medium text-muted small"
            >
              <b-form-input
                id="signup-name"
                v-model="signupForm.name"
                type="text"
                placeholder="Alex Rivera"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Email address"
              label-for="signup-email"
              label-class="font-weight-medium text-muted small"
              class="mt-3"
            >
              <b-form-input
                id="signup-email"
                v-model="signupForm.email"
                type="email"
                placeholder="alex@example.com"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label="Password"
              label-for="signup-password"
              label-class="font-weight-medium text-muted small"
              class="mt-3"
            >
              <b-form-input
                id="signup-password"
                v-model="signupForm.password"
                type="password"
                placeholder="create a strong password"
                required
              ></b-form-input>
            </b-form-group>

            <b-button
              type="submit"
              :variant="buttonVariant"
              block
              class="mt-4 py-2 font-weight-semibold"
            >
              Create account
            </b-button>
          </b-form>
        </b-tab>
      </b-tabs>

      <!-- Demo note -->
      <p class="text-center text-muted small mt-3 mb-0">
        <font-awesome-icon :icon="['fas', 'lock']" class="mr-1" />
        demo — no data is sent
      </p>
    </b-modal>
  </div>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUserGraduate,
  faBuilding,
  faShieldAlt,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Add icons to library
library.add(faUserGraduate, faBuilding, faShieldAlt, faLock);

export default {
  name: "App",
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      showModal: false,
      userRole: "seeker", // 'seeker' or 'company'
      tabIndex: 0, // 0 for login, 1 for signup
      loginForm: {
        email: "",
        password: "",
      },
      signupForm: {
        name: "",
        email: "",
        password: "",
      },
    };
  },
  computed: {
    modalTitle() {
      return this.userRole === "seeker"
        ? "Job Seeker Access"
        : "Company Access";
    },
    roleText() {
      return this.userRole === "seeker"
        ? "Job seeker"
        : "Company representative";
    },
    roleIcon() {
      return this.userRole === "seeker"
        ? ["fas", "user-graduate"]
        : ["fas", "building"];
    },
    roleBadgeVariant() {
      return this.userRole === "seeker" ? "primary" : "info";
    },
    buttonVariant() {
      return this.userRole === "seeker" ? "primary" : "info";
    },
  },
  methods: {
    openModal(role) {
      this.userRole = role;
      this.tabIndex = 0; // Reset to login tab
      this.showModal = true;

      // Add button press effect
      this.$bvToast.toast(
        `${
          role === "seeker" ? "👤 Job seeker" : "🏢 Company"
        } portal (integration ready)`,
        {
          title: "Demo Mode",
          variant: role === "seeker" ? "primary" : "info",
          solid: true,
          toaster: "b-toaster-top-center",
          autoHideDelay: 1600,
        },
      );
    },
    handleLogin() {
      const { email, password } = this.loginForm;
      const role = this.userRole;

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const user = users.find(
        (u) => u.email === email && u.password === password && u.role === role,
      );

      if (!user) {
        return this.$bvToast.toast("Invalid credentials!", {
          title: "Error",
          variant: "danger",
          solid: true,
          toaster: "b-toaster-bottom-right",
          autoHideDelay: 2500,
        });
      }

      // Save current logged in user
      localStorage.setItem("currentUser", JSON.stringify(user));

      this.$bvToast.toast(`Login successful! Welcome ${user.name}`, {
        title: "Success",
        variant: "success",
        solid: true,
        toaster: "b-toaster-bottom-right",
        autoHideDelay: 2500,
      });

      this.showModal = false;
      this.resetForms();

      // Redirect to dashboard based on role
      if (role === "seeker") {
        this.$router.push("/seeker-dashboard");
      } else {
        this.$router.push("/company-dashboard");
      }
    },
    handleSignup() {
      const { name, email, password } = this.signupForm;
      const role = this.userRole;

      // Get existing users
      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Check if email already exists
      const exists = users.find((u) => u.email === email && u.role === role);
      if (exists) {
        return this.$bvToast.toast("Email already registered!", {
          title: "Error",
          variant: "danger",
          solid: true,
          toaster: "b-toaster-bottom-right",
          autoHideDelay: 2500,
        });
      }

      // Save new user
      users.push({ name, email, password, role });
      localStorage.setItem("users", JSON.stringify(users));

      // Show toast
      this.$bvToast.toast(
        `Signup successful as ${role === "seeker" ? "Job Seeker" : "Company"}`,
        {
          title: "Success",
          variant: "success",
          solid: true,
          toaster: "b-toaster-bottom-right",
          autoHideDelay: 2500,
        },
      );

      this.showModal = false;
      this.resetForms();
    },
    resetForms() {
      this.loginForm = { email: "", password: "" };
      this.signupForm = { name: "", email: "", password: "" };
    },
  },
};
</script>

<style scoped>
/* Wrapper */
.role-selection-buttons {
  margin-top: 1.5rem;
}

/* Base Button Style */
.role-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 200px;
  padding: 12px 24px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Primary Variant */
.role-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

/* Outline Variant */
.role-btn--outline {
  background-color: #ffffff;
}

.role-btn--outline:hover {
  background-color: #0d6efd;
  color: #ffffff;
  transform: translateY(-2px);
}
/* Custom styles to complement Bootstrap */
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 1rem;
}
.gap-4 {
  gap: 1.5rem;
}

.font-weight-semibold {
  font-weight: 600;
}

/* Button hover effects */
.btn {
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 24px -10px rgba(0, 123, 255, 0.4);
}

.btn-outline-primary:hover {
  transform: scale(1.02);
  background-color: white;
  color: #0056b3;
  border-color: #0056b3;
  box-shadow: 0 8px 20px -8px rgba(0, 123, 255, 0.3);
}

/* Modal customization */
::v-deep .modal-content {
  border-radius: 1rem;
  border: none;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

::v-deep .modal-header {
  border-bottom: none;
  padding-bottom: 0;
}

::v-deep .modal-title {
  font-weight: 600;
  color: #2c3e50;
}

::v-deep .nav-tabs .nav-link {
  border: none;
  color: #6c757d;
  font-weight: 500;
  padding: 0.75rem 1rem;
}

::v-deep .nav-tabs .nav-link.active {
  color: #007bff;
  background: transparent;
  border-bottom: 2px solid #007bff;
}

::v-deep .nav-tabs .nav-link:hover:not(.active) {
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

/* Form inputs */
::v-deep .form-control {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 1rem;
  transition: all 0.2s;
}

::v-deep .form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  outline: none;
}

/* Badge styling */
::v-deep .badge {
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Text colors */
.text-primary-light {
  color: #7c9bff;
}
</style>
