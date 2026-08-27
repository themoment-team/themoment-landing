import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Values from "./components/Values";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex flex-col items-stretch w-full">
      {/* Everything down to Contact is the page; the footer is not. Without
          the landmark a screen reader has no way past the navigation to the
          content, and the page offered no skip of any kind. */}
      <main className="flex flex-col items-stretch w-full">
        <Hero />
        <Intro />
        <Values />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
