/* JOB_TO_CASH_ASSESSMENT_CONFIG (2026-10-04)
   The one place the Job-to-Cash Assessment reads its endpoint from.
   webhookUrl: the NEW dedicated Make.com Assessment webhook (its own scenario,
   separate from /fit-call). Never reuse the /fit-call webhook here.
   While webhookUrl is empty the page does not send anything: it logs the
   payload to the browser console and still shows the results screen.
   This file is served no-cache (see .htaccess), so an edit shows on the next
   page load. Bump the ?v= on the page's script tag as well when it changes.
   2026-10-04: Assessment intake webhook from Charley (POST JSON). Its Make
   scenario was OFF and untested end to end when this was added; the page
   stays Publish OFF until Charley confirms the scenario and Gil OKs publish. */
window.TCS_ASSESSMENT_CONFIG = {
  webhookUrl: 'https://hook.us2.make.com/plemr4cpo8lmiqpe2x4thfmjhohdzqx3'
};
