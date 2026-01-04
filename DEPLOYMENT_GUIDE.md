# Deployment Guide: LifeTracker Intelligence on Google Cloud Run

This document provides a comprehensive walkthrough of how the **LifeTracker Intelligence** application was containerized and deployed to Google Cloud Run using Cloud Build. It also includes strategies for maintaining a cost-effective cloud architecture.

---

## 1. Architectural Overview

The deployment follows a modern CI/CD pattern:
1.  **Source Code**: Managed in GitHub.
2.  **Containerization**: Handled by a multi-stage `Dockerfile`.
3.  **CI/CD Pipeline**: Orchestrated by **Google Cloud Build**.
4.  **Container Registry**: Images stored in **Google Artifact Registry**.
5.  **Hosting**: Serverless execution on **Google Cloud Run**.

---

## 2. Step-by-Step Deployment Process

### Step 1: Dockerization
We use a **multi-stage Docker build** to ensure the final production image is as small as possible. This reduces cold-start times and storage costs.

**Key File: `Dockerfile`**
- **Stage 1 (deps)**: Installs production dependencies.
- **Stage 2 (builder)**: Compiles the Next.js application using `npm run build`.
- **Stage 3 (runner)**: The final lean image containing only the standalone output and necessary static files.

### Step 2: Pipeline Configuration
The `cloudbuild.yaml` file defines the automation steps.

**Key File: `cloudbuild.yaml`**
1.  **Build**: Creates the Docker image with a unique ID.
2.  **Push**: Uploads the image to Artifact Registry.
3.  **Deploy**: Commands Cloud Run to update the service with the new image.

### Step 3: Triggering the Build
The deployment is triggered via the Google Cloud CLI:
```powershell
gcloud builds submit --config cloudbuild.yaml --project=[PROJECT_ID]
```

---

## 3. Verification of Success

Once the build is complete, Cloud Run provides a secure HTTPS URL.

![Dashboard Verification](https://raw.githubusercontent.com/mast251076/LifeTracker_Mast/main/docs/images/deployment_success.png)
*Explanatory Note: The screenshot above (from our verification step) confirms that the application is successfully rendering in the cloud environment, with all "Command Intelligence" modules active.*

---

## 4. Cost Optimization Strategies for Cloud Run

To stay within the Free Tier or minimize monthly spend, consider the following settings:

### A. CPU Allocation: "Only during request processing"
By default, Cloud Run can charge you for "CPU Always Allocated." For internal or low-traffic apps, change this to **CPU is only allocated during request processing**. You only pay for the milliseconds your code is actually running.

### B. Min Instances: Set to Zero
Ensure `min-instances` is set to `0`. This allows Cloud Run to "scale to zero" when no one is using the app, effectively making it **free** during idle time.

### C. Optimize Concurrency
Cloud Run can handle multiple requests on a single instance.
- **Action**: Increase `concurrency` (e.g., to 80 or 100) if your app is not CPU-intensive. This prevents the cloud from spinning up unnecessary instances for small spikes in traffic.

### D. Artifact Registry Cleanup
Old container images can accumulate storage costs.
- **Action**: Set a **Cleanup Policy** in Artifact Registry to keep only the last 3-5 images or delete images older than 30 days.

### E. Memory Right-Sizing
Next.js apps usually run well on 512MB or 1GB of RAM.
- **Action**: Monitor your memory usage in the GCP Console and lower your limits to the lowest stable value. Lower memory = lower cost per second.

---

## 5. Security Checklist
- [x] **IAM Policy**: Ensure `allUsers` is granted `roles/run.invoker` only if the site is intended to be public.
- [x] **Service Settings**: Enable "Inbound - All" for public web access.
- [x] **Environment Variables**: Never hardcode secrets in the Dockerfile; use **Secret Manager** integration for sensitive keys.

---
*Documented by Antigravity AI Engine*
