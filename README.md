# 🌐 Conneto: The Premium Internship Portal

## 📖 Introduction
Conneto is a modern, responsive, and intelligently designed internship portal acting as a seamless bridge between ambitious students and forward-thinking companies. Built with a premium UI/UX reminiscent of top-tier tech companies, Conneto streamlines the recruitment process, making it effortless for companies to find the right talent and for students to land their dream internships.

## 🎓 Why Conneto for Students?
*   **Intuitive Discovery:** Easily browse and filter high-quality internship opportunities based on skills, location, and role.
*   **One-Click Applications:** Apply instantly using detailed smart profiles where students can highlight their resume, bio, skills, and cover letters.
*   **Real-Time Status Tracking:** Track application status (Applied, Shortlisted, Interview Scheduled, Selected, Rejected) seamlessly via a modern student dashboard.
*   **Premium Experience:** Enjoy a stunning dark/light mode UI with smooth navigation and mobile-first responsiveness that makes hunting for opportunities enjoyable.

## 🏢 Why Conneto for Companies?
*   **Effortless Posting:** Create, manage, and edit detailed internship postings in seconds using a robust dashboard.
*   **Smart Applicant Tracking System (ATS):** 
    *   View all applicants in an organized, horizontal row card layout.
    *   One-click access to full student profiles and uploaded PDF resumes.
    *   AI-powered skill extraction to instantly spot matching candidates.
*   **Streamlined Recruitment Workflow:** Shortlist candidates, schedule interviews directly from the dashboard, and hire the top talent with intuitive status updates.

## 🛠️ Tech Stack & Architecture
Conneto follows a robust, scalable, and secure architecture utilizing the **MERN-like Stack** (Node.js/Express with MongoDB) and Server-Side Rendering (SSR).

### Core Technologies
*   **Backend Framework:** Node.js with Express.js
*   **Database:** MongoDB & Mongoose ORM
*   **Frontend Templating:** EJS (Embedded JavaScript)
*   **Styling & UI:** Custom modern CSS (`conneto.css`), CSS Variables for dynamic Dark/Light Theme toggling, Font Awesome icons.
*   **Authentication & Security:** `bcryptjs` for password hashing, `express-session` & `connect-mongo` for persistent, secure user sessions.
*   **File Handling:** `multer` for secure resume/file uploads.
*   **Data Processing:** `pdf-parse` for extracting skills directly from uploaded resumes.

### Architecture Overview
Conneto relies on the **Model-View-Controller (MVC)** architectural pattern:
1.  **Models (Database Layer):** Mongoose schemas define the secure and structured entity relationships for `User` (Students & Companies), `Internship`, and `Application`.
2.  **Views (Presentation Layer):** Server-rendered EJS templates dynamically generate the HTML, featuring complex layouts like sidebars, mobile navigation drawers, and data-rich grids.
3.  **Controllers/Routes (Business Logic):** Express routers handle incoming HTTP requests (authentication, posting jobs, applying, status updates). These routers interact strictly with the Models and serve the requisite Views, ensuring a clean decoupling of logic.

## 🚀 How to Run the Project Locally

Follow these steps to set up and run Conneto on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16.x or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas cluster URI)
*   Git

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/supriya-poojary/Conneto-Internship-portal.git
    cd Conneto-Internship-portal
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```
    This will install all necessary packages including Express, Mongoose, EJS, and Multer.

3.  **Environment Setup**
    Create a \`.env\` file in the root directory and configure the following environment variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string_here
    SESSION_SECRET=your_secure_random_secret_here
    ```
    *(Note: Replace the MongoDB string with your actual local or Atlas DB string, similarly for your secret string).*

4.  **Run the Server**
    For development with auto-restart on file changes:
    ```bash
    npm run dev
    ```
    For standard production start:
    ```bash
    npm start
    ```

5.  **Access the Application**
    Open your browser and navigate to:
    ```
    http://localhost:3000
    ```

## 📱 Responsiveness & Accessibility
Conneto is fully responsive across Desktop, Tablet, and Mobile devices. It utilizes intelligent CSS media queries, a responsive mobile drawer for navigation, and dynamic viewport layouts ensuring a premium experience regardless of the user's screen dimensions.

---
*Built with passion to empower the next generation of tech professionals.*
