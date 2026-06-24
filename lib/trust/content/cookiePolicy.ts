import type { PolicyDocument } from "../types";

export const cookiePolicy: PolicyDocument = {
  sections: [
    {
      heading: "1. What Are Cookies and Similar Technologies",
      subsections: [
        {
          paragraphs: [
            "Cookies are small text files stored on your device. SquareBoards also uses local storage, session storage, and similar browser technologies for authentication, preferences, and performance.",
          ],
        },
      ],
    },
    {
      heading: "2. How We Use Them",
      subsections: [
        {
          heading: "Strictly necessary",
          bullets: [
            "Keep you signed in and maintain secure sessions.",
            "Remember security tokens and CSRF protections.",
            "Load balance and route traffic reliably.",
          ],
        },
        {
          heading: "Functional",
          bullets: [
            "Store UI preferences such as dismissed announcements.",
            "Support progressive web app (PWA) installation state.",
          ],
        },
        {
          heading: "Analytics and performance",
          bullets: [
            "Understand usage patterns to improve the Platform.",
            "Measure errors and page performance.",
          ],
          paragraphs: [
            "We minimize non-essential tracking and do not sell cookie data to advertisers.",
          ],
        },
      ],
    },
    {
      heading: "3. Third-Party Cookies",
      subsections: [
        {
          bullets: [
            "Stripe may set cookies during checkout and Connect onboarding.",
            "Infrastructure and analytics providers may set cookies under their own policies.",
          ],
        },
      ],
    },
    {
      heading: "4. Your Choices",
      subsections: [
        {
          bullets: [
            "Browser settings let you block or delete cookies; blocking necessary cookies may prevent sign-in.",
            "Use private browsing to limit persistent storage between sessions.",
            "Opt out of non-essential analytics where we offer controls in settings.",
          ],
        },
      ],
    },
    {
      heading: "5. Updates",
      subsections: [
        {
          paragraphs: [
            "We may update this Cookie Policy as our technology stack evolves. Check the Trust Center for the latest version.",
          ],
        },
      ],
    },
  ],
};
