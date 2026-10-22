// Where results go. Fill formAction and the entry IDs from your Google Form's pre-filled link.
// Until then the page still grades and shows a result code to send in Telegram.
window.HW_CONFIG = {
  formAction: "",            // https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
  fields: {                  // entry.<number> for each question of the form
    student: "", lesson: "", part: "", answers: "", score: "", wrong: "", seconds: "", attempt: ""
  },
  telegram: "nurzycom"
};
