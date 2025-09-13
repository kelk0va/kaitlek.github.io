class BrowserSaveDecryptor {
    constructor() {
      this.key = "UKu52ePUBwetZ9wNX88o54dnfKRu0T1l";
    }
  
    async decryptSaveFile(fileBytes) {
      try {
        const bytes = new Uint8Array(fileBytes);
        const base64String = this.extractBase64FromBinaryFormatter(bytes);
        const decryptedJson = await this.decryptAES(base64String);
        return decryptedJson;
      } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
      }
    }
  
    extractBase64FromBinaryFormatter(fileBytes) {
      let fileString = "";
      for (let i = 0; i < fileBytes.length; i++) {
        fileString += String.fromCharCode(fileBytes[i]);
      }
      const base64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/g;
      const matches = fileString.match(base64Pattern);
      if (matches && matches.length > 0) {
        return matches.reduce((longest, current) =>
          current.length > longest.length ? current : longest
        );
      }
      throw new Error("Could not find Base64 data in BinaryFormatter file");
    }
  
    async decryptAES(base64String) {
      try {
        const encryptedBytes = CryptoJS.enc.Base64.parse(base64String);
        const cipher = CryptoJS.AES.decrypt(
          { ciphertext: encryptedBytes },
          CryptoJS.enc.Utf8.parse(this.key),
          { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
        );
        return cipher.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        throw new Error(`AES decryption failed: ${error.message}`);
      }
    }
  }
  
  class CompletionTracker {
    constructor() {
      this.saveData = null;
    }
  
    setSaveData(saveData) {
      this.saveData = saveData;
    }
  
    calculateCompletion() {
      if (!this.saveData || !this.saveData.playerData) {
        throw new Error("No save data available");
      }
  
      const playerData = this.saveData.playerData;
      let completion = 0;
      const items = [];
  
      const unlockedTools = this.getUnlockedToolsCount();
      completion += unlockedTools;
      items.push({
        name: `Tools Unlocked`,
        value: unlockedTools,
        status:
          unlockedTools >= 57
            ? "completed"
            : unlockedTools > 0
            ? "partial"
            : "missing",
        description: `${unlockedTools}/57 tools unlocked${
          unlockedTools < 57 ? ` (${57 - unlockedTools} missing)` : ""
        }`,
      });
  
      const unlockedCrests = this.getUnlockedCrestsCount();
      const crestValue = Math.max(0, unlockedCrests - 1);
      completion += crestValue;
      items.push({
        name: `Crests Unlocked`,
        value: crestValue,
        status:
          crestValue >= 8 ? "completed" : crestValue > 0 ? "partial" : "missing",
        description: `${crestValue}/8 crests unlocked${
          crestValue < 8 ? ` (${8 - crestValue} missing)` : ""
        }`,
      });
  
      const nailUpgrades = playerData.nailUpgrades || 0;
      completion += nailUpgrades;
      items.push({
        name: `Nail Upgrades`,
        value: nailUpgrades,
        status:
          nailUpgrades >= 4
            ? "completed"
            : nailUpgrades > 0
            ? "partial"
            : "missing",
        description: `${nailUpgrades}/4 nail upgrades${
          nailUpgrades < 4 ? ` (${4 - nailUpgrades} missing)` : ""
        }`,
      });
  
      const toolKitUpgrades = playerData.ToolKitUpgrades || 0;
      completion += toolKitUpgrades;
      items.push({
        name: `Tool Kit Upgrades`,
        value: toolKitUpgrades,
        status:
          toolKitUpgrades >= 4
            ? "completed"
            : toolKitUpgrades > 0
            ? "partial"
            : "missing",
        description: `${toolKitUpgrades}/4 tool kit upgrades${
          toolKitUpgrades < 4 ? ` (${4 - toolKitUpgrades} missing)` : ""
        }`,
      });
  
      const toolPouchUpgrades = playerData.ToolPouchUpgrades || 0;
      completion += toolPouchUpgrades;
      items.push({
        name: `Tool Pouch Upgrades`,
        value: toolPouchUpgrades,
        status:
          toolPouchUpgrades >= 4
            ? "completed"
            : toolPouchUpgrades > 0
            ? "partial"
            : "missing",
        description: `${toolPouchUpgrades}/4 tool pouch upgrades${
          toolPouchUpgrades < 4 ? ` (${4 - toolPouchUpgrades} missing)` : ""
        }`,
      });
  
      const silkRegenMax = playerData.silkRegenMax || 0;
      completion += silkRegenMax;
      items.push({
        name: `Silk Regen Max`,
        value: silkRegenMax,
        status: silkRegenMax > 0 ? "completed" : "missing",
        description: `${silkRegenMax} silk regen max`,
      });
  
      const abilities = [
        { name: "Needolin", has: playerData.hasNeedolin },
        { name: "Dash", has: playerData.hasDash },
        { name: "Wall Jump", has: playerData.hasWalljump },
        { name: "Harpoon Dash", has: playerData.hasHarpoonDash },
        { name: "Super Jump", has: playerData.hasSuperJump },
        { name: "Charge Slash", has: playerData.hasChargeSlash },
      ];
  
      abilities.forEach((ability) => {
        if (ability.has) {
          completion += 1;
          items.push({
            name: ability.name,
            value: 1,
            status: "completed",
            description: "Unlocked",
          });
        } else {
          items.push({
            name: ability.name,
            value: 0,
            status: "missing",
            description: "Not unlocked",
          });
        }
      });
  
      const healthValue = Math.max(0, (playerData.maxHealthBase || 5) - 5);
      completion += healthValue;
      items.push({
        name: `Health Upgrades`,
        value: healthValue,
        status:
          (playerData.maxHealthBase || 5) >= 10
            ? "completed"
            : (playerData.maxHealthBase || 5) > 5
            ? "partial"
            : "missing",
        description: `${
          playerData.maxHealthBase || 5
        }/10 max health (${healthValue} count towards completion)${
          (playerData.maxHealthBase || 5) < 10
            ? ` (${10 - (playerData.maxHealthBase || 5)} missing)`
            : ""
        }`,
      });
  
      const silkValue = Math.max(0, (playerData.silkMax || 9) - 9);
      completion += silkValue;
      items.push({
        name: `Silk Upgrades`,
        value: silkValue,
        status:
          (playerData.silkMax || 9) >= 18
            ? "completed"
            : (playerData.silkMax || 9) > 9
            ? "partial"
            : "missing",
        description: `${
          playerData.silkMax || 9
        }/18 max silk (${silkValue} count towards completion)${
          (playerData.silkMax || 9) < 18
            ? ` (${18 - (playerData.silkMax || 9)} missing)`
            : ""
        }`,
      });
  
      const specialItems = [
        { name: "Bound Crest Upgrader", has: playerData.HasBoundCrestUpgrader },
        { name: "White Flower", has: this.hasWhiteFlower() },
      ];
      specialItems.forEach((item) => {
        if (item.has) {
          completion += 1;
          items.push({
            name: item.name,
            value: 1,
            status: "completed",
            description: "Found",
          });
        } else {
          items.push({
            name: item.name,
            value: 0,
            status: "missing",
            description: "Not found",
          });
        }
      });
  
      return { totalCompletion: completion, items };
    }
  
    getUnlockedToolsCount() {
      if (
        !this.saveData ||
        !this.saveData.playerData ||
        !this.saveData.playerData.Tools ||
        !this.saveData.playerData.Tools.savedData
      ) {
        return 0;
      }
      const toolsData = this.saveData.playerData.Tools.savedData;
      let count = 0;
      for (const tool of toolsData) {
        if (tool.Data && tool.Data.IsUnlocked && !tool.Data.IsHidden) {
          count++;
        }
      }
      return count;
    }
  
    getUnlockedCrestsCount() {
      if (
        !this.saveData ||
        !this.saveData.playerData ||
        !this.saveData.playerData.ToolEquips ||
        !this.saveData.playerData.ToolEquips.savedData
      ) {
        return 0;
      }
      const crestsData = this.saveData.playerData.ToolEquips.savedData;
      let count = 0;
      for (const crest of crestsData) {
        if (
          crest.Data &&
          crest.Data.IsUnlocked &&
          crest.Name.toLowerCase() !== "cursed"
        ) {
          count++;
        }
      }
      return count;
    }
  
    hasWhiteFlower() {
      if (
        !this.saveData ||
        !this.saveData.playerData ||
        !this.saveData.playerData.Collectables ||
        !this.saveData.playerData.Collectables.savedData
      ) {
        return false;
      }
      const collectablesData = this.saveData.playerData.Collectables.savedData;
      for (const collectable of collectablesData) {
        if (
          collectable.Name === "White Flower" &&
          collectable.Data &&
          collectable.Data.Amount > 0
        ) {
          return true;
        }
      }
      return false;
    }
  
    getMissingCrests() {
      const knownCrests = [
        "Hunter",
        "Reaper",
        "Wanderer",
        "Warrior",
        "Hunter_v2",
        "Toolmaster",
        "Witch",
        "Spell",
      ];
      if (
        !this.saveData ||
        !this.saveData.playerData ||
        !this.saveData.playerData.ToolEquips ||
        !this.saveData.playerData.ToolEquips.savedData
      ) {
        return knownCrests;
      }
      const unlockedCrests = new Set();
      const crestsData = this.saveData.playerData.ToolEquips.savedData;
      for (const crest of crestsData) {
        if (crest.Data && crest.Data.IsUnlocked) {
          unlockedCrests.add(crest.Name);
        }
      }
      return knownCrests.filter((crest) => !unlockedCrests.has(crest));
    }
  
    getMissingTools() {
      if (
        !this.saveData ||
        !this.saveData.playerData ||
        !this.saveData.playerData.Tools ||
        !this.saveData.playerData.Tools.savedData
      ) {
        return [];
      }
      const toolsData = this.saveData.playerData.Tools.savedData;
      const missingTools = [];
      for (const tool of toolsData) {
        if (!tool.Data || !tool.Data.IsUnlocked) {
          missingTools.push(tool.Name);
        }
      }
      return missingTools;
    }
  }
  
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");
  const jsonOutput = document.getElementById("jsonOutput");
  const errorMessage = document.getElementById("errorMessage");
  const copyBtn = document.getElementById("copyBtn");
  const completionSection = document.getElementById("completionSection");
  const checkCompletionBtn = document.getElementById("checkCompletionBtn");
  const statsBtn = document.getElementById("checkStatsBtn");
  const completionResults = document.getElementById("completionResults");
  
  const decryptor = new BrowserSaveDecryptor();
  const tracker = new CompletionTracker();
  
  function hideAllMessages() {
    errorMessage.style.display = "none";
    result.style.display = "none";
    completionSection.style.display = "none";
    loading.style.display = "none";
  }
  
  async function processFile(file) {
    hideAllMessages();
    loading.style.display = "block";
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decryptedJson = await decryptor.decryptSaveFile(arrayBuffer);
      const saveData = JSON.parse(decryptedJson);
      tracker.setSaveData(saveData);
      const formattedJson = JSON.stringify(saveData, null, 2);
      jsonOutput.textContent = formattedJson;
      loading.style.display = "none";
      result.style.display = "block";
      completionSection.style.display = "block";
    } catch (error) {
      loading.style.display = "none";
      errorMessage.textContent = `❌ Error: ${error.message}`;
      errorMessage.style.display = "block";
    }
  }
  
  function checkCompletion() {
    try {
      if (typeof statsResults !== "undefined") {
        statsResults.innerHTML = "";
      }
      const completionFromSaveRaw = findValueByKeyInsensitive(
        tracker.saveData,
        "completionpercentage"
      );
      const completionPercent = Math.max(
        0,
        Math.min(100, Number.parseFloat(completionFromSaveRaw ?? "0") || 0)
      );
      const completionBreakdown = tracker.calculateCompletion();
  
      let html = `
              <div class="completion-category">
                  <div class="category-title">📊 Main Completion Progress</div>
                  <div class="progress-bar">
                      <div class="progress-fill" style="width: ${completionPercent}%"></div>
                  </div>
                  <div class="progress-text">${completionPercent}%</div>
              </div>
          `;
  
      const missingCrests = tracker.getMissingCrests();
      const missingTools = tracker.getMissingTools();
  
      const categories = {
        "Tools & Equipment": completionBreakdown.items.filter(
          (item) =>
            item.name.includes("Tools") ||
            item.name.includes("Crests") ||
            item.name.includes("Nail") ||
            item.name.includes("Kit") ||
            item.name.includes("Pouch")
        ),
        Abilities: completionBreakdown.items.filter(
          (item) =>
            item.name.includes("Dash") ||
            item.name.includes("Jump") ||
            item.name.includes("Needolin") ||
            item.name.includes("Charge")
        ),
        Upgrades: completionBreakdown.items.filter(
          (item) => item.name.includes("Health") || item.name.includes("Silk")
        ),
        "Special Items": completionBreakdown.items.filter(
          (item) => item.name.includes("Bound") || item.name.includes("White")
        ),
      };
  
      for (const [categoryName, items] of Object.entries(categories)) {
        if (items.length > 0) {
          html += `
                      <div class="completion-category">
                          <div class="category-title">${categoryName}</div>
                  `;
          items.forEach((item) => {
            const statusClass =
              item.status === "completed" ? "status-completed" : "status-missing";
            html += `
                          <div class="completion-item">
                              <div class="item-name">${item.name}</div>
                              <div class="item-status ${statusClass}">${item.description}</div>
                          </div>
                      `;
          });
          html += `</div>`;
        }
      }
  
      const fleaCounts = getFleaCounts(tracker.saveData || {});
      if (fleaCounts.total > 0) {
        const fleaPercent = Math.round(
          (fleaCounts.found / fleaCounts.total) * 100
        );
        const unfreedFleas = getUnfreedFleas(tracker.saveData || {});
  
        html += `
                  <div class="completion-category">
                      <div class="category-title">Fleas</div>
                      <div class="progress-bar">
                          <div class="progress-fill" style="width: ${fleaPercent}%"></div>
                      </div>
                      <div class="progress-text">${fleaCounts.found}/${
          fleaCounts.total
        } (${fleaPercent}%)</div>
                      <div class="completion-item">
                          <div class="item-name">Fleas Rescued</div>
                          <div class="item-status ${
                            fleaCounts.found === fleaCounts.total
                              ? "status-completed"
                              : fleaCounts.found > 0
                              ? "status-partial"
                              : "status-missing"
                          }">
                              ${fleaCounts.found}/${fleaCounts.total}
                          </div>
                      </div>
                      ${
                        fleaCounts.giantPresent
                          ? `
                      <div class="completion-item">
                          <div class="item-name">Giant Flea Tamed</div>
                          <div class="item-status ${
                            fleaCounts.giantTamed
                              ? "status-completed"
                              : "status-missing"
                          }">
                              ${fleaCounts.giantTamed ? "Yes" : "No"}
                          </div>
                      </div>`
                          : ""
                      }
              `;
  
        if (unfreedFleas.length > 0) {
          html += `
                      <div class="completion-item">
                          <div class="item-name">Missing Fleas (${unfreedFleas.length})</div>
                          <div class="item-status status-missing">
                              <div style="margin-top: 10px;">
                  `;
  
          const fleasByArea = {};
          unfreedFleas.forEach((flea) => {
            if (!fleasByArea[flea.area]) {
              fleasByArea[flea.area] = [];
            }
            fleasByArea[flea.area].push(flea);
          });
  
          Object.entries(fleasByArea).forEach(([area, fleas]) => {
            html += `
                          <div style="margin-bottom: 15px; padding: 10px; background: rgba(255,107,107,0.1); border-radius: 5px; border-left: 3px solid #ff6b6b;">
                              <div style="font-weight: bold; color: #4ecdc4; margin-bottom: 8px;">📍 ${area} Area:</div>
                      `;
  
            fleas.forEach((flea) => {
              html += `
                              <div style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 3px;">
                                  <div style="font-family: 'Courier New', monospace; color: #ffd93d; font-size: 0.85em; margin-bottom: 3px;">${flea.id}</div>
                                  <div style="color: #e0e0e0; font-size: 0.9em; margin-bottom: 5px;">${flea.description}</div>
                                  <div style="color: #b0b0b0; font-style: italic; font-size: 0.8em;">💡 ${flea.hints}</div>
                              </div>
                          `;
            });
  
            html += `</div>`;
          });
  
          html += `
                              </div>
                          </div>
                      </div>
                  `;
        }
  
        html += `</div>`;
      }
  
      if (missingCrests.length > 0 || missingTools.length > 0) {
        html += `
                  <div class="completion-category">
                      <div class="category-title">🔍 Missing Items Details</div>
              `;
        if (missingCrests.length > 0) {
          html += `
                      <div style="margin-bottom: 15px;">
                          <strong>Missing Crests (${
                            missingCrests.length
                          }):</strong><br>
                          <span style="color: #666; font-size: 0.9em;">${missingCrests.join(
                            ", "
                          )}</span>
                      </div>
                  `;
        }
        if (missingTools.length > 0) {
          html += `
                      <div style="margin-bottom: 15px;">
                          <strong>Missing Tools (${
                            missingTools.length
                          }):</strong><br>
                          <span style="color: #666; font-size: 0.9em;">${missingTools
                            .slice(0, 10)
                            .join(", ")}${
            missingTools.length > 10
              ? ` ... and ${missingTools.length - 10} more`
              : ""
          }</span>
                      </div>
                  `;
        }
        html += `</div>`;
      }
  
      completionResults.innerHTML = html;
      try {
        completionResults.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      } catch (_) {}
    } catch (error) {
      completionResults.innerHTML = `
              <div class="error">
                  ❌ Error calculating completion: ${error.message}
              </div>
          `;
    }
  }
  
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput.textContent);
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => {
        copyBtn.textContent = "📋 Copy";
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  });
  
  checkCompletionBtn.addEventListener("click", checkCompletion);
  statsBtn.addEventListener("click", showStats);
  
  function findValueByKeyInsensitive(obj, targetKey) {
    const keyLower = targetKey.toLowerCase();
    const stack = [obj];
    while (stack.length) {
      const current = stack.pop();
      if (current && typeof current === "object") {
        for (const [k, v] of Object.entries(current)) {
          if (k.toLowerCase() === keyLower) {
            return v;
          }
          if (v && typeof v === "object") {
            stack.push(v);
          }
        }
      }
    }
    return undefined;
  }
  
  function formatHMS(totalSeconds) {
    if (typeof totalSeconds !== "number" || !isFinite(totalSeconds)) return "N/A";
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  
  function showStats() {
    try {
      if (typeof completionResults !== "undefined") {
        completionResults.innerHTML = "";
      }
      const saveData = tracker.saveData;
      if (!saveData) {
        statsResults.innerHTML = '<div class="error">❌ No save loaded.</div>';
        return;
      }
      const playTimeRaw = findValueByKeyInsensitive(saveData, "playTime");
      const playTimeHMS = formatHMS(
        typeof playTimeRaw === "string" ? parseFloat(playTimeRaw) : playTimeRaw
      );
      const health = findValueByKeyInsensitive(saveData, "Health");
      const silk = findValueByKeyInsensitive(saveData, "Silk");
      const rosaries = findValueByKeyInsensitive(saveData, "Rosaries");
      const shellShards = findValueByKeyInsensitive(saveData, "ShellShards");
      let html = "";
      html += '<div class="completion-category">';
      html += '<div class="category-title">🕒 Play Time</div>';
      html += `<div class="completion-item"><div class="item-name">Total</div><div class="item-status status-completed">${playTimeHMS}</div></div>`;
      html += "</div>";
      html += '<div class="completion-category">';
      html += '<div class="category-title">📋 Summary</div>';
      html += `<div class="completion-item"><div class="item-name">Health</div><div class="item-status ${
        health != null ? "status-completed" : "status-missing"
      }">${health ?? "N/A"}</div></div>`;
      html += `<div class="completion-item"><div class="item-name">Silk</div><div class="item-status ${
        silk != null ? "status-completed" : "status-missing"
      }">${silk ?? "N/A"}</div></div>`;
      html += `<div class="completion-item"><div class="item-name">Rosaries</div><div class="item-status ${
        rosaries != null ? "status-completed" : "status-missing"
      }">${rosaries ?? "N/A"}</div></div>`;
      html += `<div class="completion-item"><div class="item-name">Shell Shards</div><div class="item-status ${
        shellShards != null ? "status-completed" : "status-missing"
      }">${shellShards ?? "N/A"}</div></div>`;
      html += "</div>";
      statsResults.innerHTML = html;
      try {
        statsResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}
    } catch (e) {
        console.log(e.message);
    }
  }
  
  const statsResults = document.getElementById("statsResults");
  const fleaResults = document.getElementById("fleaResults");
  
  function showFleaTracking() {
    try {
      if (typeof completionResults !== "undefined") {
        completionResults.innerHTML = "";
      }
      if (typeof statsResults !== "undefined") {
        statsResults.innerHTML = "";
      }
  
      const saveData = tracker.saveData;
      if (!saveData) {
        fleaResults.innerHTML = '<div class="error">❌ No save loaded.</div>';
        return;
      }
  
      const unfreedFleas = getUnfreedFleas(saveData);
      const allFleas = getAllFleaLocations();
      const fleaCounts = getFleaCounts(saveData);
  
      const totalFleas = allFleas.length;
      const freedFleas = totalFleas - unfreedFleas.length;
      const unfreedCount = unfreedFleas.length;
      const completionPercent = Math.round((freedFleas / totalFleas) * 100);
  
      let html = `
              <div class="completion-category">
                  <div class="category-title">🐛 Flea Tracking Overview</div>
                  <div class="progress-bar">
                      <div class="progress-fill" style="width: ${completionPercent}%"></div>
                  </div>
                  <div class="progress-text">${freedFleas}/${totalFleas} (${completionPercent}%)</div>
                  <div class="completion-item">
                      <div class="item-name">Total Fleas</div>
                      <div class="item-status status-completed">${totalFleas}</div>
                  </div>
                  <div class="completion-item">
                      <div class="item-name">Freed Fleas</div>
                      <div class="item-status status-completed">${freedFleas}</div>
                  </div>
                  <div class="completion-item">
                      <div class="item-name">Unfreed Fleas</div>
                      <div class="item-status ${
                        unfreedCount === 0 ? "status-completed" : "status-missing"
                      }">${unfreedCount}</div>
                  </div>
          `;
  
      if (fleaCounts.giantPresent) {
        html += `
                  <div class="completion-item">
                      <div class="item-name">Giant Flea Tamed</div>
                      <div class="item-status ${
                        fleaCounts.giantTamed
                          ? "status-completed"
                          : "status-missing"
                      }">
                          ${fleaCounts.giantTamed ? "Yes" : "No"}
                      </div>
                  </div>
              `;
      }
  
      html += `</div>`;
  
      if (unfreedFleas.length === 0) {
        html += `
                  <div class="completion-category">
                      <div class="category-title">🎉 Congratulations!</div>
                      <div class="completion-item">
                          <div class="item-name">All Fleas Freed</div>
                          <div class="item-status status-completed">You have successfully freed all the fleas!</div>
                      </div>
                  </div>
              `;
      } else {
        html += `
                  <div class="completion-category">
                      <div class="category-title">🔍 Unfreed Fleas - Location Guide</div>
              `;
  
        const fleasByArea = {};
        unfreedFleas.forEach((flea) => {
          if (!fleasByArea[flea.area]) {
            fleasByArea[flea.area] = [];
          }
          fleasByArea[flea.area].push(flea);
        });
  
        Object.entries(fleasByArea).forEach(([area, fleas]) => {
          html += `
                      <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid #ff6b6b;">
                          <div style="font-weight: bold; color: #4ecdc4; margin-bottom: 10px; font-size: 1.1em;">📍 ${area} Area</div>
                  `;
  
          fleas.forEach((flea) => {
            html += `
                          <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px;">
                              <div style="font-family: 'Courier New', monospace; color: #ffd93d; font-size: 0.9em; margin-bottom: 5px;">${flea.id}</div>
                              <div style="color: #e0e0e0; margin-bottom: 8px; line-height: 1.4;">${flea.description}</div>
                              <div style="color: #b0b0b0; font-style: italic; font-size: 0.9em; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 3px; border-left: 3px solid #4ecdc4;">
                                  💡 ${flea.hints}
                              </div>
                          </div>
                      `;
          });
  
          html += `</div>`;
        });
  
        html += `</div>`;
      }
  
      fleaResults.innerHTML = html;
      try {
        fleaResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}
    } catch (error) {
      fleaResults.innerHTML = `
              <div class="error">
                  ❌ Error loading flea data: ${error.message}
              </div>
          `;
    }
  }
  
  function countFleasRecursive(obj, result) {
    if (!obj || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "object" && v !== null) {
        countFleasRecursive(v, result);
      } else {
        if (typeof v === "boolean" && k.startsWith("SavedFlea_")) {
          result.total += 1;
          if (v) result.found += 1;
        }
        if (k.toLowerCase() === "tamedgiantflea") {
          result.giantFoundPresent = true;
          if (v === true) result.giantFound = true;
        }
      }
    }
  }
  function getFleaCounts(saveData) {
    const result = {
      total: 0,
      found: 0,
      giantFoundPresent: false,
      giantFound: false,
    };
    countFleasRecursive(saveData, result);
    const totalWithGiant = result.total + (result.giantFoundPresent ? 1 : 0);
    const foundWithGiant = result.found + (result.giantFound ? 1 : 0);
    return {
      total: totalWithGiant,
      found: foundWithGiant,
      giantPresent: result.giantFoundPresent,
      giantTamed: result.giantFound,
    };
  }
  
  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  });
  
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  });
  
  hideAllMessages();