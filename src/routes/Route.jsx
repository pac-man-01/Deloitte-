import { createBrowserRouter } from "react-router-dom";
import App from "../App";

// Public and User Layouts
import RoleSelectionPage from "@/pages/role/RoleSelectionPage";
import LoginPage from "@/pages/login/LoginPage";
import RoleLayout from "@/layouts/RoleLayout";
import LandingLayout from "@/layouts/LandingLayout";
import PortalLayout from "@/layouts/PortalLayout";

// User Pages
import Course from "@/pages/courses/Courses";
import SkillsDashboard from "@/pages/skill/SkillsDashboard";
import QuizApp from "@/pages/assessment/Assessment";
import EmployeeProfile from "@/pages/profile/EmployeeProfile";
import Dashboard from "@/pages/dashboard/Dashboard";
import LearningHistory from "@/pages/learning-history/LearningHistory";
import LearningPathway from "@/pages/learning-pathway/LearningPathway";
import LeaderBoard from "@/pages/leaderboard/LeaderBoard";

// Error Components
import NotAuthorized from "@/components/NotAuthorized";
import PageNotFound from "@/components/PageNotFound";
// import { AdminDashboard } from "@/pages/admin/dashboard/AdminDashboard";
import AdminDashboard from "@/pages/admin/dashboard/AdminDashboard";

// Users
import RequireAdmin from "./RequireAdmin";
import SkillBadgeAdmin from "@/pages/admin/SkillBadgeAdmin";
import StaticAdminSkillBadge from "@/pages/skill-badge/StaticAdminSkillBadge";
import MySkillBadgeApplications from "@/pages/skill-badge/MySkillBadgesApplication";
import MyBadges from "@/pages/skill-badge/MyBadge";
import SkillBadgeForm from "@/pages/skill-badge/SkillBadgeForm";
import AdminQuizGenerator from "@/pages/admin/AdminQuizGenerator";
import QuizEmployee from "@/pages/assessment/QuizEmployee";


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <LandingLayout />
      },
      {
        path: 'role',
        element: <RoleLayout />,
        children: [
          {
            index: true,
            element: <RoleSelectionPage />
          },
          {
            path: 'login',
            element: <LoginPage />
          }
        ]
      },
      {
        path: 'home',
        element: <PortalLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'learning-history',
            element: <LearningHistory />
          },
          {
            path: 'learning-pathway',
            element: <LearningPathway />
          },
          {
            path: 'courses',
            element: <div>Hello</div>
          },
          {
            path: 'courses/:techSkill',
            element: <Course />
          },
          {
            path: 'skills',
            element: <SkillsDashboard />
          },
          {
            path: 'profile',
            element: <EmployeeProfile />
          },
          {
            path: 'assessment/:skill',
            element: <QuizApp />
          },
          {
            path: 'leaderboard',
            element: <LeaderBoard />
          },
          {
            path: "skill-badge",
            element: <SkillBadgeForm />,
          },
          {
            path: "skill-badge-application",
            element: <MySkillBadgeApplications />,
          },
          {
            path: "skill-badge-mybadge",
            element: <MyBadges />,
          },  
          {
            path: "take-quiz",
            element: <QuizEmployee />,
          },  
        ]
      },
      // ---------- Admin Routes ----------
      {
        path: 'admin',
        element: <RequireAdmin><PortalLayout /></RequireAdmin>,
        children: [
          {
            index: true,
            element: <AdminDashboard />
          },
          {
            path: "badge-approve",
            element: <SkillBadgeAdmin />,
          },
          {
            path: "static-badge-approve",
            element: <StaticAdminSkillBadge />,
          },
          {
            path: "gen-quiz",
            element: <AdminQuizGenerator />,
          },

        ]
      },

      {
        path: '/not-authorized',
        element: <NotAuthorized />
      },
      {
        path: '*',
        element: <PageNotFound />
      }
    ]
  }
]);

export default router;
