# pc-optamizer
cursor project

Core Features Breakdown
1. Component Selection Interface
Users input their current PC build:

CPU (brand, model, socket type)
GPU (model, VRAM)
Motherboard (chipset, socket, PCIe version)
RAM (capacity, speed, type)
Storage (SSD/HDD, capacity, interface)
PSU (wattage, efficiency rating)
Monitor (resolution, refresh rate, adaptive sync tech: FreeSync/G-Sync)
Cooling (air/liquid, TDP capacity)

2. Usage Scenario Selection
Dropdown/radio buttons:

Gaming (specify target resolution/FPS: 1080p 60Hz, 1440p 144Hz, 4K, etc.)
Content Creation (video editing, 3D rendering, streaming)
AI/ML Workloads (local LLMs, image generation, training)
General Productivity
Mixed Use (weight sliders for each category)

3. Bottleneck Detection Engine
Analyze mismatches:

CPU-GPU imbalance (e.g. RTX 4090 paired with Ryzen 5 3600)
RAM bottlenecks (insufficient capacity/speed for workload)
Monitor mismatch (high-end GPU with 60Hz 1080p monitor)
Storage (HDD as boot drive, insufficient SSD for game library)
PSU headroom (insufficient wattage for upgrade paths)
Motherboard limitations (PCIe 3.0 bottlenecking Gen4 SSD, no CPU upgrade path)
Cooling inadequacy (stock cooler on high-TDP CPU)

4. Upgrade Recommendation System
Prioritized suggestions based on:

Biggest performance gain per dollar
Compatibility constraints (socket type, PSU connectors, case clearance)
Platform-specific optimizations (AMD FreeSync → AMD GPU priority, Intel DDR5 support, etc.)
Future-proofing (AM5 socket for long-term CPU upgrades vs. dead-end platforms)

Output example:
Priority 1: Upgrade Monitor (High Impact, $250-400)
- Current: 1080p 60Hz
- Bottleneck: Your RTX 4070 is underutilized
- Recommendation: 1440p 144Hz FreeSync monitor
- Performance gain: 140% more visible frames, matches GPU capability

Priority 2: Add 16GB RAM (Medium Impact, $60)
- Current: 16GB DDR4-3200
- Bottleneck: AI workloads hitting memory limits
- Recommendation: 32GB total (2x16GB kit)
- Performance gain: Prevents stuttering in LLM inference

Technical Architecture
Frontend (User Interface)
Tech Stack Recommendation:

React + TypeScript (component reusability, type safety for complex data)
Tailwind CSS (rapid UI development)
React Hook Form (for component input validation)
Zustand or Context API (state management for build configuration)

Key Components:
/src
  /components
    ComponentSelector.tsx (dropdown for each PC part)
    UsageScenarioForm.tsx (radio buttons + sliders)
    BottleneckVisualizer.tsx (visual representation of imbalances)
    UpgradeCard.tsx (individual recommendation with priority badge)
    BuildSummary.tsx (current vs. recommended specs side-by-side)
  /data
    components.json (database of CPUs, GPUs, mobos with specs)
    compatibilityRules.json (socket types, PSU requirements, etc.)
  /logic
    bottleneckDetection.ts (scoring algorithm)
    upgradeEngine.ts (recommendation logic)
Backend (Optional for MVP)
For a static version (no user accounts):

Pure frontend app, all logic runs in browser
Component database stored as JSON files (fetched on load)

For full version (user accounts, save builds, price tracking):

Node.js + Express or Next.js API routes
PostgreSQL or Supabase (store user builds, component DB with pricing)
Cron job for price scraping (PCPartPicker API or web scraping)


Data Model
Component Database Schema
typescript// CPU
{
  id: "ryzen-7-7800x3d",
  brand: "AMD",
  model: "Ryzen 7 7800X3D",
  socket: "AM5",
  cores: 8,
  threads: 16,
  baseClock: 4.2,
  boostClock: 5.0,
  tdp: 120,
  price: 449,
  performance_tier: "high-end-gaming" // for bottleneck scoring
}

// GPU
{
  id: "rtx-4070",
  brand: "NVIDIA",
  model: "RTX 4070",
  vram: 12,
  vramType: "GDDR6X",
  tdp: 200,
  pcie: "4.0",
  targetResolution: ["1440p", "4K-medium"], // optimal use cases
  freesync: false,
  gsync: true,
  performance_tier: "high-end"
}

// Monitor
{
  id: "lg-27gp850",
  resolution: "2560x1440",
  refreshRate: 165,
  adaptiveSync: "FreeSync Premium",
  panelType: "IPS",
  price: 350
}
User Build Schema
typescript{
  buildId: "user123-build1",
  components: {
    cpu: "ryzen-7-7800x3d",
    gpu: "rtx-4070",
    mobo: "b650-aorus-elite",
    ram: { capacity: 32, speed: 6000, type: "DDR5" },
    monitor: "lg-27gp850",
    psu: { wattage: 750, efficiency: "80+ Gold" }
  },
  usageScenario: {
    gaming: 0.7,
    aiWorkloads: 0.2,
    productivity: 0.1
  }
}

Bottleneck Detection Algorithm (Simplified)
typescriptfunction detectBottlenecks(build, scenario) {
  const issues = [];

  // GPU-Monitor mismatch
  if (build.gpu.targetResolution.includes("4K") && 
      build.monitor.resolution === "1920x1080") {
    issues.push({
      type: "monitor_underutilization",
      severity: "high",
      component: "monitor",
      recommendation: "Upgrade to 1440p or 4K monitor"
    });
  }

  // CPU-GPU imbalance (simplified scoring)
  const cpuScore = calculatePerformanceScore(build.cpu);
  const gpuScore = calculatePerformanceScore(build.gpu);
  
  if (gpuScore > cpuScore * 1.5 && scenario.gaming > 0.5) {
    issues.push({
      type: "cpu_bottleneck",
      severity: "medium",
      component: "cpu",
      recommendation: `Upgrade to ${suggestCPU(build.gpu)}`
    });
  }

  // FreeSync GPU mismatch
  if (build.monitor.adaptiveSync === "FreeSync" && 
      build.gpu.brand === "NVIDIA") {
    issues.push({
      type: "adaptive_sync_mismatch",
      severity: "low",
      component: "gpu",
      recommendation: "Consider AMD GPU for native FreeSync support"
    });
  }

  // AM5 platform optimization
  if (build.cpu.socket === "AM4" && scenario.aiWorkloads > 0.3) {
    issues.push({
      type: "platform_upgrade",
      severity: "medium",
      component: "cpu_mobo",
      recommendation: "Upgrade to AM5 platform (Ryzen 7000+) for better AI performance and DDR5 support"
    });
  }

  return prioritizeByImpact(issues, scenario);
}

UI/UX Flow
Step 1: Build Input

Form with dropdowns for each component (searchable, autocomplete)
"Don't know?" tooltips with images of each part
Import from PCPartPicker link (optional advanced feature)

Step 2: Usage Scenario

Radio buttons for primary use
Sliders for mixed workloads (Gaming 60% / AI 30% / Productivity 10%)
Preset templates ("Competitive FPS", "AAA 4K Gaming", "LLM Developer", "Streaming PC")

Step 3: Analysis Dashboard

Visual bottleneck graph (bar chart showing component balance)
Colored severity badges (red = critical, yellow = moderate, green = optimal)
Upgrade cards sorted by priority with:

Current component
Recommended upgrade
Expected performance gain
Price estimate
"Why this matters" explanation



Step 4: Shopping List

Export recommended upgrades as a list
Links to retailers (affiliate opportunity)
"Upgrade now vs. later" phased approach for budget builds


MVP Feature Prioritization
Phase 1 (Build This First)
✅ Component selection form (CPU, GPU, RAM, Monitor)
✅ Basic bottleneck detection (GPU-monitor, CPU-GPU imbalance)
✅ 3-5 upgrade recommendations with explanations
✅ Static JSON component database (20-30 popular parts)
Phase 2

Full component database (hundreds of parts)
Advanced bottleneck detection (PSU, cooling, storage)
Usage scenario weighting system
Price tracking integration

Phase 3

User accounts (save builds)
Build comparison tool
Community builds gallery
Automated price alerts
