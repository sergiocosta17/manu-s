export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-10 bg-white shadow-2xl rounded-2xl border-t-4 border-brand-yellow max-w-lg">
        <h1 className="text-5xl font-extrabold text-brand-dark mb-4">
           Manu's Smash
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Frontend inicializado com sucesso! O Tailwind v4 está pronto para a ação.
        </p>
        <button className="bg-brand-yellow hover:bg-yellow-500 text-brand-dark font-bold py-3 px-8 rounded-full transition-colors cursor-pointer shadow-md">
          Bora Codar!
        </button>
      </div>
    </div>
  )
}