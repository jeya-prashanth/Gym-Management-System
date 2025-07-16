//  /** @type {import('tailwindcss').Config} */
// export default {
//    content: ["./src/**/*.{html,js}"],
//    theme: {
//      extend: {},
//    },
//    plugins: [],
//  }

/** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{html,js,jsx}"],
   theme: {
     extend: {
       colors: {
         primary: '#0e121d',
         navbar: '#1c1f2a',
       }
     },
   },
   plugins: [],
}