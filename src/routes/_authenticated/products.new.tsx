import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCategories, createProduct } from "@/lib/products.functions";
import { CloudinaryUploader, type UploadedImage } from "@/components/CloudinaryUploader";
import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/products/new")({
  head: () => ({ meta: [{ title: "New Product — Elimi Trust Ltd" }] }),
  component: NewProduct,
});

function NewProduct() {
  const navigate = useNavigate();
  const fetchCats = useServerFn(listCategories);
  const create = useServerFn(createProduct);
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => fetchCats() });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("RWF");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("");
  const [brand, setBrand] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = cats.data?.categories.find((c: any) => c.id === categoryId)?.slug;
  const isVehicle = ["cars", "motorcycles", "trucks", "vehicles"].includes(slug ?? "");
  const isRealEstate = ["real-estate", "land", "rentals"].includes(slug ?? "");
  const isElectronic = ["smartphones", "laptops", "computers", "tablets"].includes(slug ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (images.length < 3) { setError("At least 3 images required."); return; }
    if (!categoryId) { setError("Category required."); return; }
    setSubmitting(true);
    try {
      const res = await create({ data: {
        title, description, price: Number(price), currency, category_id: categoryId,
        condition: condition || null, brand: brand || null, quantity: 1,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        district: district || null, sector: sector || null, location_text: null,
        featured: false,
        extra_fields: extras,
        images,
      }});
      if (res.ok) navigate({ to: "/products/$id", params: { id: res.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const fld = "w-full px-4 py-2.5 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)]";
  const lbl = "block text-xs font-semibold tracking-widest text-muted-foreground mb-2";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[var(--gold)] mb-6"><ArrowLeft className="w-4 h-4" /> Back to dashboard</Link>
      <h1 className="text-3xl font-display gold-text mb-8">New Product</h1>
      <form onSubmit={submit} className="luxury-card rounded-2xl p-7 space-y-6">
        <div>
          <label className={lbl}>Images (min 3)</label>
          <CloudinaryUploader value={images} onChange={setImages} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={lbl}>Title</label>
            <input className={fld} required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Category {cats.isLoading && <span className="text-muted-foreground">(loading…)</span>}</label>
            <select
              className={fld + " appearance-none bg-[var(--input)] text-foreground pr-10"}
              style={{ colorScheme: "dark", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%23c8a96a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="" style={{ background: "#1a1a1a", color: "#fff" }}>Select a category…</option>
              {(cats.data?.categories ?? []).map((c: any) => (
                <option key={c.id} value={c.id} style={{ background: "#1a1a1a", color: "#fff" }}>{c.name}</option>
              ))}
            </select>
            {cats.error && <p className="text-xs text-destructive mt-1">Failed to load categories. Refresh the page.</p>}
          </div>
          <div>
            <label className={lbl}>Price</label>
            <div className="flex gap-2">
              <input className={fld} type="number" required min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-3 py-2.5 rounded-lg bg-[var(--input)] border border-border">
                <option>RWF</option><option>USD</option><option>EUR</option>
              </select>
            </div>
          </div>
          <div><label className={lbl}>Brand</label><input className={fld} value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
          <div><label className={lbl}>Condition</label>
            <select className={fld} value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="">—</option><option>New</option><option>Used</option><option>Refurbished</option>
            </select>
          </div>
          <div><label className={lbl}>District</label><input className={fld} value={district} onChange={(e) => setDistrict(e.target.value)} /></div>
          <div><label className={lbl}>Sector</label><input className={fld} value={sector} onChange={(e) => setSector(e.target.value)} /></div>
          <div className="md:col-span-2"><label className={lbl}>Tags (comma separated)</label><input className={fld} value={tags} onChange={(e) => setTags(e.target.value)} /></div>
          <div className="md:col-span-2">
            <label className={lbl}>Description</label>
            <textarea className={fld + " min-h-[140px]"} required maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        {(isVehicle || isRealEstate || isElectronic) && (
          <div className="border-t border-border pt-6">
            <div className="text-xs font-semibold tracking-widest text-[var(--gold)] mb-4">CATEGORY-SPECIFIC DETAILS</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isVehicle && (<>
                <Extra label="Model" k="model" v={extras} on={setExtras} />
                <Extra label="Year" k="year" v={extras} on={setExtras} />
                <Extra label="Mileage" k="mileage" v={extras} on={setExtras} />
                <Extra label="Fuel" k="fuel_type" v={extras} on={setExtras} />
                <Extra label="Transmission" k="transmission" v={extras} on={setExtras} />
              </>)}
              {isRealEstate && (<>
                <Extra label="Bedrooms" k="bedrooms" v={extras} on={setExtras} />
                <Extra label="Bathrooms" k="bathrooms" v={extras} on={setExtras} />
                <Extra label="Area (m²)" k="area_size" v={extras} on={setExtras} />
                <Extra label="Property Type" k="property_type" v={extras} on={setExtras} />
              </>)}
              {isElectronic && (<>
                <Extra label="RAM" k="ram" v={extras} on={setExtras} />
                <Extra label="Storage" k="storage" v={extras} on={setExtras} />
                <Extra label="Processor" k="processor" v={extras} on={setExtras} />
                <Extra label="OS" k="operating_system" v={extras} on={setExtras} />
                <Extra label="Battery Health" k="battery_health" v={extras} on={setExtras} />
              </>)}
            </div>
          </div>
        )}

        {error && <div className="text-sm text-destructive">{error}</div>}
        <button disabled={submitting} type="submit" className="btn-gold w-full py-3.5 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Publish Product
        </button>
      </form>
    </div>
  );
}

function Extra({ label, k, v, on }: { label: string; k: string; v: Record<string, string>; on: (x: Record<string, string>) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-widest text-muted-foreground mb-2">{label}</label>
      <input value={v[k] ?? ""} onChange={(e) => on({ ...v, [k]: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg bg-[var(--input)] border border-border focus:outline-none focus:border-[var(--gold)]" />
    </div>
  );
}
