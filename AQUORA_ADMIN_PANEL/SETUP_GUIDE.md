# 🛠 AQUORA ADMIN PANEL — LOCAL SETUP GUIDE

Step-by-step instructions to run the Admin Panel and Backend locally on Windows.

---

## 1. Prerequisites
- **Node.js** v18+ (tested on Node v20.10.0)
- **npm** v9+
- A modern web browser (Chrome, Edge, Firefox, Safari)

---

## 2. Installation & Running

### A. Run Backend Service (Port 3001)
Open a terminal in `C:\Users\DELL\Desktop\client hardware\AQUORA_ADMIN_PANEL\backend`:
```bash
npm install
npm run build
npm start
```
*The backend will initialize the relational datastore with 5 sanitizer formulas and listen at:*
`http://localhost:3001` (REST) and `ws://localhost:3001/ws` (WebSockets).

### B. Run Admin Dashboard Frontend (Port 3002)
Open a second terminal in `C:\Users\DELL\Desktop\client hardware\AQUORA_ADMIN_PANEL\frontend`:
```bash
npm install
npm run dev
```
*Open your browser and navigate to:*  
👉 **`http://localhost:3002/`**

---

## 3. Verify System Operations
1. Click **Dashboard** to view active machines, orders, and telemetry.
2. Click **Products** to edit prices or toggle availability. Notice System 1 immediately fetches the updated prices without re-flashing!
3. Click **Calibration** to perform test dispenses and fine-tune flow sensor constants.
4. Click **Inventory** to view live tank volume estimates and log liquid refills.
