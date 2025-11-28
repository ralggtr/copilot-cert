document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      const activitiesList = document.getElementById("activities-list");
      const activitySelect = document.getElementById("activity");

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        // Create activity card
        const card = document.createElement("div");
        card.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Spots Available:</strong> ${spotsLeft} / ${details.max_participants}</p>
          <div class="activity-participants">
            <h5>Current Participants (${details.participants.length}):</h5>
            <ul>
              ${details.participants.length > 0 
                ? details.participants.map(email => `<li>${email}</li>`).join('')
                : '<li class="no-participants">No participants yet</li>'
              }
            </ul>
          </div>
        `;

        activitiesList.appendChild(card);

        // Add to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = `${name} (${spotsLeft} spots left)`;
        if (spotsLeft === 0) {
          option.disabled = true;
          option.textContent += " - FULL";
        }
        activitySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading activities:", error);
      document.getElementById("activities-list").innerHTML = 
        '<p class="error">Failed to load activities. Please try again later.</p>';
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    if (!activity) {
      showMessage("Please select an activity", "error");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, "success");
        signupForm.reset();
        // Reload activities to show updated participant list
        fetchActivities();
      } else {
        showMessage(data.detail || "Signup failed", "error");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showMessage("An error occurred. Please try again.", "error");
    }
  });

  function showMessage(text, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Initialize app
  fetchActivities();
});
