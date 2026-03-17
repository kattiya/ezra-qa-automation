# 🚀 Ezra QA Automation — Playwright E2E Suite

![Playwright](https://img.shields.io/badge/Playwright-E2E-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Status](https://img.shields.io/badge/Status-Stable-success)
![Tests](https://img.shields.io/badge/Coverage-Critical%20Flows-orange)

> 💡 QA Engineer Assignment — End-to-End Booking Flow Automation  
> Built with **Playwright + TypeScript + POM + Allure Reporting**

---

## 🎯 What This Project Demonstrates

- ✅ Real-world E2E automation strategy
- ✅ Business-critical test prioritization
- ✅ Clean scalable architecture (POM)
- ✅ Stable auth/session handling
- ✅ Debuggable + stakeholder-friendly reporting
- ✅ Demo-ready flows for engineers and hiring managers

---

## 🧱 Project Structure

```
ezra-qa-automation/
├── pages/
├── tests/
├── fixtures/
├── utils/
├── .auth/
├── playwright.config.ts
├── README.md
└── .env.example
```

---

## ⚙️ Setup

```bash
git clone https://github.com/<your-username>/ezra-qa-automation.git
cd ezra-qa-automation

npm install
npx playwright install chromium

cp env.example .env
```

---

## 🔐 Authentication Strategy

Uses a **setup project** to log in once and reuse session:

```bash
npx playwright test --project=setup

npm install -D allure-playwright allure-commandline
```

### Why this matters

- Faster tests
- Cleaner E2E flows
- Realistic user behavior

---

## 🧪 Running Tests

```bash
npx playwright test
npx playwright test --headed
npx playwright test tests/tc01-successful-booking.spec.ts --headed
npx playwright test tests/tc02-payment-declined.spec.ts --headed
npx playwright test tests/tc03-three-slots-enforcement.spec.ts --headed
npx playwright test --debug
npx playwright show-report
```

---

## 📊 Reporting

### HTML Report

```bash
npx playwright show-report
```

---

### 🔥 Allure Report

#### Install

```bash
npm install -D allure-playwright allure-commandline
```

> ⚠️ Requires Java:
```bash
brew install openjdk
```

#### Generate + Open

```bash
npx playwright test
npx allure generate ./allure-results --clean
npx allure open ./allure-report
```

---

### 📸 Example Allure Report

<img width="1350" height="736" alt="Screenshot 2026-03-17 at 6 55 34 PM" src="https://github.com/user-attachments/assets/39f4d62d-92ef-4575-a76f-10802d9be827" />


---

## 🧪 Test Coverage

| Test | Description | Priority |
|------|-------------|----------|
| TC-01 | Successful booking | P0 |
| TC-02 | Declined → retry | P0 |
| TC-03 | Min 3 slots enforcement | P0 |

---

## 🧠 Why These Tests Matter

- 💰 Revenue protection (booking flow)
- 💳 Payment failure recovery
- 📅 Scheduling integrity

---

## 🏗 Architecture

- Page Object Model (POM)
- Shared auth session
- Dual reporting (HTML + Allure)

---

## ⚖️ Trade-offs

| Decision | Reason |
|---------|--------|
| workers: 1 | avoid test collisions |
| staging only | safe payments |
| UI validation | faster coverage |

---

## 📈 Future Improvements

- Add API validation
- Add CI (GitHub Actions)
- Add cross-browser runs
- Add visual testing

---

## 👩‍💻 Author

**Kate Vnuk**  
Senior QA / Product Ops / Automation

---

⭐ If you like this project, feel free to star it!
