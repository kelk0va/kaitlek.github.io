const fleaLocationDictionary = {
  SavedFlea_Bone_06: {
    area: "Bone",
    description: "",
    hints: "",
  },
  SavedFlea_Bone_East_05: {
    area: "Bone East",
    description: "",
    hints: "",
  },
  SavedFlea_Bone_East_17b: {
    area: "Bone East",
    description: "",
    hints: "",
  },
  SavedFlea_Bone_East_10_Church: {
    area: "Bone East",
    description: "",
    hints: "",
  },

  SavedFlea_Dock_16: {
    area: "Dock",
    description: "",
    hints: "",
  },
  SavedFlea_Dock_03d: {
    area: "Dock",
    description: "",
    hints: "",
  },

  SavedFlea_Ant_03: {
    area: "Ant",
    description: "",
    hints: "",
  },

  SavedFlea_Greymoor_15b: {
    area: "Greymoor",
    description: "",
    hints: "",
  },
  SavedFlea_Greymoor_06: {
    area: "Greymoor",
    description: "",
    hints: "",
  },

  SavedFlea_Shellwood_03: {
    area: "Shellwood",
    description: "",
    hints: "",
  },

  SavedFlea_Coral_35: {
    area: "Coral",
    description: "",
    hints: "",
  },
  SavedFlea_Coral_24: {
    area: "Coral",
    description: "",
    hints: "",
  },

  SavedFlea_Dust_12: {
    area: "Dust",
    description: "",
    hints: "",
  },
  SavedFlea_Dust_09: {
    area: "Dust",
    description: "",
    hints: "",
  },

  SavedFlea_Belltown_04: {
    area: "Belltown",
    description: "",
    hints: "",
  },

  SavedFlea_Crawl_06: {
    area: "Crawl",
    description: "",
    hints: "",
  },

  SavedFlea_Slab_Cell: {
    area: "Slab",
    description: "",
    hints: "",
  },
  SavedFlea_Slab_06: {
    area: "Slab",
    description: "",
    hints: "",
  },

  SavedFlea_Shadow_28: {
    area: "Shadow",
    description: "",
    hints: "",
  },
  SavedFlea_Shadow_10: {
    area: "Shadow",
    description: "",
    hints: "",
  },

  SavedFlea_Under_23: {
    area: "Under",
    description: "",
    hints: "",
  },
  SavedFlea_Under_21: {
    area: "Under",
    description: "",
    hints: "",
  },

  SavedFlea_Song_14: {
    area: "Song",
    description: "",
    hints: "",
  },
  SavedFlea_Song_11: {
    area: "Song",
    description: "",
    hints: "",
  },

  SavedFlea_Peak_05c: {
    area: "Peak",
    description: "",
    hints: "",
  },

  SavedFlea_Library_09: {
    area: "Library",
    description: "",
    hints: "",
  },
  SavedFlea_Library_01: {
    area: "Library",
    description: "",
    hints: "",
  },
};

function getUnfreedFleas(saveData) {
  const unfreedFleas = [];

  function searchForUnfreedFleas(obj) {
    if (!obj || typeof obj !== "object") return;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        searchForUnfreedFleas(value);
      } else {
        if (
          typeof value === "boolean" &&
          key.startsWith("SavedFlea_") &&
          value === false
        ) {
          const locationInfo = fleaLocationDictionary[key];
          if (locationInfo) {
            unfreedFleas.push({
              id: key,
              area: locationInfo.area,
              description: locationInfo.description,
              hints: locationInfo.hints,
            });
          }
        }
      }
    }
  }

  searchForUnfreedFleas(saveData);
  return unfreedFleas;
}

function getAllFleaLocations() {
  return Object.entries(fleaLocationDictionary).map(([key, value]) => ({
    id: key,
    area: value.area,
    description: value.description,
    hints: value.hints,
  }));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fleaLocationDictionary,
    getUnfreedFleas,
    getAllFleaLocations,
  };
}
