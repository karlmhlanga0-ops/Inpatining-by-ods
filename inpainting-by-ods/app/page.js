"use client";

import { useState } from "react";

export default function Home() {
  // DEMO FIX: We use live, public HTTP URLs here so Replicate's cloud GPU can access them.
  const [catalogItems, setCatalogItems] = useState([
    { id: 1, name: "Streetwear Tee", productUrl: "#", modelPhoto: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Urban Hoodie", productUrl: "#", modelPhoto: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80" },
    { id: 3, name: "Denim Jacket", productUrl: "#", modelPhoto: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80" },
  ]);

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [userFace, setUserFace] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(catalogItems[0]);
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScrape = async () => {
    if (!scrapeUrl) return alert("Paste a Shelflife URL first.");
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      const data = await res.json();
      
      if (data.success) {
        const newItem = {
          id: Date.now(),
          name: data.title,
          productUrl: data.productUrl,
          modelPhoto: data.image,
        };
        setCatalogItems([newItem, ...catalogItems]); 
        setSelectedProduct(newItem); 
        setScrapeUrl(""); 
      } else {
        alert("Scraping failed: " + data.error);
      }
    } catch (err) {
      alert("Network error during scraping.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleFaceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserFace(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userFace || !selectedProduct) return alert("Upload face and select product.");
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userFace: userFace,
          targetModelImage: selectedProduct.modelPhoto, // This is now a public URL
        }),
      });
      const data = await res.json();
      if (data.success) setResult(data.result);
      else alert("Generation failed: " + data.error);
    } catch (err) {
      alert("Error generating image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="border-b border-zinc-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ODS Try-On Engine</h1>
            <p className="text-zinc-400 mt-2">CMS Ingestion & Customer Validation Pipeline</p>
          </div>
        </header>

        {/* ADMIN INGESTION */}
        <section className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl border-l-4 border-l-blue-500 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Phase 1: Admin Onboarding (CMS)</h2>
          <p className="text-sm text-zinc-400 mb-4">Paste a product URL to extract the catalog image into the engine.</p>
          <div className="flex gap-4">
            <input 
              type="url" 
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://www.shelflife.co.za/product/..."
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleScrape}
              disabled={isScraping}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-50 transition-colors"
            >
              {isScraping ? "Extracting..." : "Import Product"}
            </button>
          </div>
        </section>

        {/* CUSTOMER VTO */}
        <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-6">Phase 2: Client Virtual Try-On</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <label className="block text-sm font-medium mb-2">1. Upload Customer Face</label>
                <input type="file" accept="image/jpeg, image/png" onChange={handleFaceUpload} className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-800 file:text-white" />
                {userFace && <img src={userFace} alt="Face" className="mt-4 rounded-lg h-32 w-full object-cover border border-zinc-700" />}
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 h-96 overflow-y-auto">
                <label className="block text-sm font-medium mb-4">2. Select Garment</label>
                <div className="grid grid-cols-2 gap-3">
                  {catalogItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedProduct(item)}
                      className={`border p-2 rounded-lg transition-all ${selectedProduct.id === item.id ? 'border-white bg-zinc-800 scale-[1.02]' : 'border-zinc-700 hover:border-zinc-500'}`}
                    >
                      <img src={item.modelPhoto} alt={item.name} className="w-full h-24 object-cover rounded bg-zinc-900 mb-2" />
                      <p className="text-[10px] text-zinc-300 truncate">{item.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !userFace}
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 disabled:opacity-50 shadow-md"
              >
                {isGenerating ? "Synthesizing Look..." : "Generate Try-On"}
              </button>
            </div>

            <div className="bg-zinc-950 rounded-lg border border-zinc-800 lg:col-span-2 flex flex-col items-center justify-center min-h-[500px] p-6 relative">
              {isGenerating && (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin"></div>
                  <p className="mt-4 text-zinc-400 font-mono text-sm tracking-wide">Mapping facial geometry & blending lighting...</p>
                </div>
              )}
              
              {!isGenerating && result && (
                <div className="w-full h-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                  <img src={result} alt="Generated Try-On" className="max-h-[500px] w-auto object-contain rounded-lg shadow-2xl border border-zinc-700" />
                  <a href={result} download="My_Shelflife_Look.jpg" className="mt-6 text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md transition-colors border border-zinc-600">
                    Download Hi-Res Output
                  </a>
                </div>
              )}

              {!isGenerating && !result && (
                <div className="text-center opacity-50">
                  <svg className="w-16 h-16 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-zinc-400 text-sm">Customer generated photo will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}