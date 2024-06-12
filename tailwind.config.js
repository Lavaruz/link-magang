/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js,ejs}", "./public/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        body: "#F8FAE5",  //Putih Kuning
        second: "#43766C" //Hijau
      },
    },
  },
  plugins: [],
};
