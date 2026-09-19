import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { saveBrandSettings, getMyBrands, uploadBrandLogo } from "../services/brandService";
import facebookIcon from "../assets/Facebook.svg";
import linkedinIcon from "../assets/LinkedIn.svg";
import instagramIcon from "../assets/Instagram.svg";
import twitterIcon from "../assets/X.svg";
// MOBILE ONLY: same logo used in Dashboard/Campaign's mobile header.
import updoLogo from "../assets/logo.png";

// ---------------------------------------------------------------------------
// Brand creation is a ONE-TIME edit, not a live-editable settings page:
//   - User fills in whatever they have (only Brand Name is required).
//   - Confirm locks everything (fields fade + become read-only) and saves
//     to the backend permanently via saveBrandSettings(), then uploads the
//     logo file (if any) via uploadBrandLogo() using the new brand's id.
//   - Reset is only available BEFORE confirmation — once locked, it's
//     disabled. Locking in is permanent from the UI's perspective.
//   - On mount, we check the backend for an existing brand (getMyBrands())
//     and pre-fill + lock the form if one is found, so a brand saved
//     earlier (even via Swagger/another session) shows up correctly.
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: facebookIcon },
  { id: "linkedin", label: "LinkedIn", icon: linkedinIcon },
  { id: "instagram", label: "Instagram", icon: instagramIcon },
  { id: "twitter", label: "Twitter/X", icon: twitterIcon },
];

// MOBILE ONLY: category dropdown options (from the Anima mobile design).
const MOBILE_CATEGORIES = ["Technology", "Retail", "Hospitality", "Healthcare", "Education", "Other"];

// MOBILE ONLY: burger-menu drawer items (same set as Dashboard/Campaign).
const MOBILE_NAV = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Brand Setting", to: null },
  { label: "Campaign", to: "/campaign" },
  { label: "Scheduler", to: "/scheduler" },
  { label: "Home", to: "/" },
];

const cardClass =
  "bg-gray-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 p-6";

function FormField({ label, name, value, onChange, disabled, required, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={name} className="text-zinc-300 text-xs font-semibold font-['Poppins'] uppercase tracking-wide">
        {label}
        {required && <span className="text-purple-300 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full h-14 px-4 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] text-indigo-100 text-sm font-['Poppins'] placeholder:text-zinc-500 transition-colors disabled:cursor-not-allowed ${
          error ? "outline-red-400" : "outline-neutral-600 focus:outline-purple-300"
        }`}
      />
      {error && <span className="text-red-400 text-xs font-['Poppins']">Brand Name is required.</span>}
    </div>
  );
}

// MOBILE ONLY: smaller field wrapper matching the Anima mobile spacing/type scale.
function MobileFormField({ label, name, value, onChange, disabled, required, error, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={`m-${name}`} className="text-zinc-300 text-[11px] font-semibold font-['Poppins'] uppercase tracking-wide">
        {label}
        {required && <span className="text-purple-300 ml-1">*</span>}
      </label>
      <input
        id={`m-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full h-11 px-3 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] text-indigo-100 text-xs font-['Poppins'] placeholder:text-zinc-500 transition-colors disabled:cursor-not-allowed ${
          error ? "outline-red-400" : "outline-neutral-600 focus:outline-purple-300"
        }`}
      />
      {error && <span className="text-red-400 text-[11px] font-['Poppins']">Brand Name is required.</span>}
    </div>
  );
}

function SocialButton({ platform, connected, disabled, onClick, compact }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 bg-slate-900 rounded-xl hover:-translate-y-0.5 transition-transform disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
        compact ? "px-3 py-3 flex-1 min-w-[70px]" : "px-6 py-4"
      }`}
    >
      <img src={platform.icon} alt={platform.label} className={compact ? "w-6 h-6 opacity-70" : "w-8 h-8 opacity-70"} />
      <div className={`text-zinc-300 font-medium font-['Poppins'] ${compact ? "text-[11px]" : "text-sm"}`}>{platform.label}</div>
      <div className={`w-2.5 h-2.5 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 ${connected ? "bg-purple-300" : "bg-transparent"}`} />
    </button>
  );
}

// Small paste-a-link popup, opened per platform.
function SocialLinkModal({ platform, initialValue, onSave, onClose }) {
  const [value, setValue] = useState(initialValue || "");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-gray-800 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-600 p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-indigo-100 text-lg font-semibold font-['K2D']">
          Paste your {platform.label} link
        </h3>
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`https://${platform.id}.com/yourbrand`}
          className="w-full h-14 px-4 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-sm font-['Poppins'] placeholder:text-zinc-500 focus:outline-purple-300"
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-sm font-['Poppins'] hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(value)}
            className="px-5 h-11 rounded-full bg-purple-300 text-violet-900 text-sm font-medium font-['Poppins'] hover:bg-purple-200 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  brandName: "",
  category: "",
  niche: "",
  tagline: "",
  website: "",
  phone: "",
};

const EMPTY_SOCIALS = { facebook: "", linkedin: "", instagram: "", twitter: "" };
const EMPTY_COLORS = { primary: "", secondary: "", accent: "" };

export default function BrandSettings() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [socialLinks, setSocialLinks] = useState(EMPTY_SOCIALS);
  const [colors, setColors] = useState(EMPTY_COLORS);
  const [logoFile, setLogoFile] = useState(null);
  const [activeSocialModal, setActiveSocialModal] = useState(null); // platform id or null
  const [brandNameError, setBrandNameError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // On mount: check if the user already has a saved brand (from this
  // session, an earlier one, or even Swagger) and pre-fill + lock if so.
  useEffect(() => {
    async function loadExistingBrand() {
      try {
        const brands = await getMyBrands();
        if (brands.length > 0) {
          const brand = brands[0];
          setForm({
            brandName: brand.name || "",
            category: brand.niche || "",
            niche: brand.niche || "",
            tagline: brand.tagline || "",
            website: brand.website || "",
            phone: brand.phone || "",
          });
          setSocialLinks({
            facebook: brand.social_handles?.facebook || "",
            linkedin: brand.social_handles?.linkedin || "",
            instagram: brand.social_handles?.instagram || "",
            twitter: brand.social_handles?.twitter || "",
          });
          setColors({
            primary: brand.colors?.primary || "",
            secondary: brand.colors?.secondary || "",
            accent: brand.colors?.accent || "",
          });
          setIsLocked(true);
        }
      } catch (err) {
        console.error("Failed to load existing brand:", err);
      } finally {
        setLoadingExisting(false);
      }
    }
    loadExistingBrand();
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const enter = (delay = "") =>
    `transition-all duration-700 ease-out ${delay} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`;

  // MOBILE ONLY: burger drawer state + smooth open/close (same pattern as
  // Dashboard/Campaign — exit transition plays before unmount).
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  function closeMenu() {
    setClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, 300); // must match the transition duration below
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function handleMobileNav(to) {
    closeMenu();
    if (to) navigate(to);
  }

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "brandName" && value.trim()) setBrandNameError(false);
  };

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setColors((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setLogoFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };

  const handleSaveSocialLink = (value) => {
    setSocialLinks((prev) => ({ ...prev, [activeSocialModal]: value }));
    setActiveSocialModal(null);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setSocialLinks(EMPTY_SOCIALS);
    setColors(EMPTY_COLORS);
    setLogoFile(null);
    setBrandNameError(false);
    setIsLocked(false);
  };

  const handleConfirm = async () => {
    if (!form.brandName.trim()) {
      setBrandNameError(true);
      return;
    }

    setSaving(true);
    try {
      const result = await saveBrandSettings({
        brandName: form.brandName,
        category: form.category,
        niche: form.niche,
        tagline: form.tagline,
        website: form.website,
        phone: form.phone,
        socialLinks,
        colors,
        logoFileName: logoFile?.name ?? "",
      });

      if (logoFile && result.brandId) {
        await uploadBrandLogo(result.brandId, logoFile);
      }

      setIsLocked(true);
    } catch (err) {
      console.error("Failed to save brand settings:", err);
      // TODO: show an error toast instead of just logging
    } finally {
      setSaving(false);
    }
  };

  const activePlatform = SOCIAL_PLATFORMS.find((p) => p.id === activeSocialModal);

  return (
    <div className="min-h-screen w-full bg-[#000b2e] md:bg-slate-900">
      {/* Desktop/tablet (md+): existing Navbar, untouched. */}
      <div className="hidden md:contents">
        <Navbar />
      </div>

      {/* MOBILE ONLY (<md): header with logo + burger */}
      <header className="md:hidden sticky top-0 z-30 h-[66px] w-full flex items-center justify-between px-[15px] bg-[#000b2e]/90 backdrop-blur-md border-b border-slate-700/40">
        <img src={updoLogo} alt="UPDO" className="h-7 w-14 object-cover" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="w-11 h-11 -mr-2 flex items-center justify-center text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 rounded-lg"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* MOBILE ONLY (<md): right-side drawer, smooth open + close */}
      {(menuOpen || closing) && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              closing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />
          <nav
            id="mobile-navigation"
            aria-label="Brand settings navigation"
            className={`absolute right-0 top-0 h-full w-[218px] max-w-[80vw] bg-[#00061f] border-l border-slate-700/40 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              closing ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="absolute right-[10px] top-[10px] w-11 h-11 flex items-center justify-center text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-300 rounded-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <ul className="pt-[111px] pl-6 pr-4 flex flex-col items-start gap-5">
              {MOBILE_NAV.map((item) => {
                const active = item.to === null;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleMobileNav(item.to)}
                      aria-current={active ? "page" : undefined}
                      className={`text-indigo-100 text-2xl font-normal font-['K2D'] leading-tight whitespace-nowrap border-b-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 ${
                        active ? "border-purple-500" : "border-transparent"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* ===================================================================
          DESKTOP (md and up) — untouched, exact original markup.
          =================================================================== */}
      <main className="hidden md:flex max-w-5xl mx-auto px-6 pt-14 pb-16 flex-col gap-2">
        <div className={`text-center flex flex-col gap-1 mb-8 ${enter()}`}>
          <h1 className="text-indigo-100 text-3xl font-semibold font-['K2D']">Brand Settings</h1>
          <p className="text-zinc-300 text-base font-['Poppins']">
            {loadingExisting
              ? "Loading your brand..."
              : "Define your brand's core identity for consistent UPDO AI generation."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
          {/* Left column: Profile Identity + Upload Logo — fades once locked */}
          <div className={`flex flex-col gap-6 transition-opacity duration-500 ${isLocked ? "opacity-50 pointer-events-none" : ""} ${enter("delay-100")}`}>
            <section className={`flex flex-col gap-5 ${cardClass}`}>
              <h2 className="text-indigo-100 text-2xl font-semibold font-['K2D']">Profile Identity</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Brand Name"
                  name="brandName"
                  value={form.brandName}
                  onChange={handleFieldChange}
                  disabled={isLocked}
                  required
                  error={brandNameError}
                  placeholder="e.g. UPDO AI"
                />
                <FormField
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleFieldChange}
                  disabled={isLocked}
                  placeholder="e.g. SaaS, Retail, Food"
                />
              </div>

              <FormField
                label="Niche"
                name="niche"
                value={form.niche}
                onChange={handleFieldChange}
                disabled={isLocked}
                placeholder="e.g. Hotels, Digital Marketing, Fitness"
              />
              <FormField
                label="Tagline"
                name="tagline"
                value={form.tagline}
                onChange={handleFieldChange}
                disabled={isLocked}
                placeholder="e.g. Great coffee, honestly made"
              />
              <FormField
                label="Website"
                name="website"
                value={form.website}
                onChange={handleFieldChange}
                disabled={isLocked}
                placeholder="https://yourbrand.com"
              />
              <FormField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleFieldChange}
                disabled={isLocked}
                placeholder="+91 98765 43210"
              />

              <div className="flex justify-center gap-8 pt-2">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <SocialButton
                    key={platform.id}
                    platform={platform}
                    connected={Boolean(socialLinks[platform.id])}
                    disabled={isLocked}
                    onClick={() => setActiveSocialModal(platform.id)}
                  />
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-indigo-100 text-2xl font-semibold font-['K2D'] text-center mb-4">Upload Logo</h2>
              <label
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`flex flex-col items-center gap-2 p-10 bg-slate-950/50 rounded-xl outline outline-2 outline-offset-[-2px] outline-neutral-600 cursor-pointer ${isLocked ? "cursor-not-allowed" : "hover:outline-purple-300"}`}
              >
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelect} disabled={isLocked} />
                <span className="text-indigo-100 text-lg font-['Poppins']">
                  {logoFile ? logoFile.name : "Drop images here"}
                </span>
                <span className="text-zinc-300 text-xs font-semibold font-['Poppins'] tracking-wide">
                  Support JPG, PNG, WEBP (Max 10MB)
                </span>
              </label>
            </section>
          </div>

          {/* Right column: Color Palette + Reset/Confirm */}
          <div className={`flex flex-col gap-6 ${enter("delay-200")}`}>
            <section className={`flex flex-col gap-5 transition-opacity duration-500 ${isLocked ? "opacity-50 pointer-events-none" : ""} ${cardClass}`}>
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-purple-300 rounded-full" />
                <h2 className="text-zinc-300 text-xl font-semibold font-['K2D'] tracking-wide">Color Palette</h2>
              </div>
              <p className="text-white text-xs font-semibold font-['Poppins'] tracking-wide">
                Choose the colours for your brand
              </p>

              {["primary", "secondary", "accent"].map((key) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-white text-xs font-['Poppins'] capitalize w-20">{key} :</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      name={key}
                      value={colors[key]}
                      onChange={handleColorChange}
                      disabled={isLocked}
                      placeholder="Hex Code"
                      className="flex-1 h-10 px-3 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 text-white text-xs font-['Poppins'] placeholder:text-white/40 focus:outline-purple-300"
                    />
                    <div
                      className="w-8 h-8 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-600 shrink-0"
                      style={{ backgroundColor: colors[key] || "transparent" }}
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* Reset is only available BEFORE confirmation — disabled once
                the brand is locked in, since only one confirmation is
                allowed per brand. */}
            <div className={`flex flex-col items-center gap-4 ${enter("delay-300")}`}>
              <button
                type="button"
                onClick={handleReset}
                disabled={isLocked}
                className="w-28 h-14 rounded-full outline outline-2 outline-offset-[-2px] outline-indigo-100 text-indigo-100 text-base font-extrabold font-['Poppins'] hover:bg-slate-800/50 transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-transparent"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLocked || saving}
                className="flex items-center gap-2 px-8 h-14 bg-purple-300 rounded-full text-violet-900 text-base font-normal font-['Poppins'] shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] hover:bg-purple-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100"
              >
                {saving ? "Saving..." : isLocked ? "Confirmed" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ===================================================================
          MOBILE (<md) — built from the Anima mobile design, converted from
          its fixed absolute-pixel layout to a normal flow layout so it
          works across real phone heights. Section order follows Anima:
          Profile Identity -> Color Palette -> Social Links -> Logo Upload
          -> Reset/Confirm. Niche field added (missing from the Anima
          design but present on desktop).
          =================================================================== */}
      <main className="md:hidden max-w-md mx-auto px-4 pt-6 pb-24 flex flex-col gap-4">
        <div className={`text-center flex flex-col gap-1 mb-2 ${enter()}`}>
          <h1 className="text-indigo-100 text-xl font-semibold font-['K2D']">Brand Settings</h1>
          <p className="text-zinc-300 text-xs font-['Poppins'] px-4">
            {loadingExisting
              ? "Loading your brand..."
              : (
                <>Define your brand's core identity to <strong className="font-bold">UPDO</strong> AI generation consistency.</>
              )}
          </p>
        </div>

        {/* Profile Identity */}
        <section className={`flex flex-col gap-4 transition-opacity duration-500 ${isLocked ? "opacity-50 pointer-events-none" : ""} ${cardClass} p-5 ${enter("delay-100")}`}>
          <h2 className="text-indigo-100 text-lg font-semibold font-['K2D']">Profile Identity</h2>

          <MobileFormField
            label="Brand Name"
            name="brandName"
            value={form.brandName}
            onChange={handleFieldChange}
            disabled={isLocked}
            required
            error={brandNameError}
            placeholder="e.g. UPDO AI"
          />

          {/* MOBILE ONLY: dropdown per the Anima design (desktop keeps its text input). */}
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="m-category" className="text-zinc-300 text-[11px] font-semibold font-['Poppins'] uppercase tracking-wide">
              Category
            </label>
            <select
              id="m-category"
              name="category"
              value={form.category}
              onChange={handleFieldChange}
              disabled={isLocked}
              className="w-full h-11 px-3 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 text-indigo-100 text-xs font-['Poppins'] focus:outline-purple-300 disabled:cursor-not-allowed"
            >
              <option value="" />
              {MOBILE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Niche — present on desktop, missing from the Anima mobile design; added here to match. */}
          <MobileFormField
            label="Niche"
            name="niche"
            value={form.niche}
            onChange={handleFieldChange}
            disabled={isLocked}
            placeholder="e.g. Hotels, Digital Marketing, Fitness"
          />

          <MobileFormField
            label="Tagline"
            name="tagline"
            value={form.tagline}
            onChange={handleFieldChange}
            disabled={isLocked}
            placeholder="e.g. Great coffee, honestly made"
          />

          <MobileFormField
            label="Website"
            name="website"
            type="url"
            value={form.website}
            onChange={handleFieldChange}
            disabled={isLocked}
            placeholder="https://yourbrand.com"
          />

          <MobileFormField
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleFieldChange}
            disabled={isLocked}
            placeholder="+91 98765 43210"
          />
        </section>

        {/* Color Palette */}
        <section className={`flex flex-col gap-4 transition-opacity duration-500 ${isLocked ? "opacity-50 pointer-events-none" : ""} ${cardClass} p-5 ${enter("delay-150")}`}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-7 bg-purple-300 rounded-full" />
            <h2 className="text-zinc-300 text-base font-semibold font-['K2D'] tracking-wide">Color Palette</h2>
          </div>
          <p className="text-white text-[11px] font-semibold font-['Poppins'] tracking-wide">
            Choose the colours for your brand
          </p>

          {["primary", "secondary", "accent"].map((key) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-white text-xs font-['Poppins'] capitalize w-20 shrink-0">{key} :</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  name={key}
                  value={colors[key]}
                  onChange={handleColorChange}
                  disabled={isLocked}
                  placeholder="Hex Code"
                  className="flex-1 min-w-0 h-9 px-3 bg-slate-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 text-white text-xs font-['Poppins'] placeholder:text-white/40 focus:outline-purple-300"
                />
                <div
                  className="w-7 h-7 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-600 shrink-0"
                  style={{ backgroundColor: colors[key] || "transparent" }}
                />
              </div>
            </div>
          ))}
        </section>

        {/* Social Media Links — own section on mobile, per the Anima design
            (desktop keeps these embedded inside Profile Identity). */}
        <section className={`flex flex-col gap-4 transition-opacity duration-500 ${isLocked ? "opacity-50 pointer-events-none" : ""} ${cardClass} p-5 ${enter("delay-200")}`}>
          <h2 className="text-indigo-100 text-lg font-semibold font-['K2D']">Social Links</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {SOCIAL_PLATFORMS.map((platform) => (
              <SocialButton
                key={platform.id}
                platform={platform}
                connected={Boolean(socialLinks[platform.id])}
                disabled={isLocked}
                onClick={() => setActiveSocialModal(platform.id)}
                compact
              />
            ))}
          </div>
        </section>

        {/* Upload Logo */}
        <section className={`transition-opacity duration-500 ${isLocked ? "opacity-50 pointer-events-none" : ""} ${cardClass} p-5 ${enter("delay-250")}`}>
          <h2 className="text-indigo-100 text-lg font-semibold font-['K2D'] text-center mb-3">Upload Logo</h2>
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`flex flex-col items-center gap-2 p-6 bg-slate-950/50 rounded-xl outline outline-2 outline-offset-[-2px] outline-neutral-600 cursor-pointer ${isLocked ? "cursor-not-allowed" : "hover:outline-purple-300"}`}
          >
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelect} disabled={isLocked} />
            <span className="text-indigo-100 text-sm font-['Poppins'] text-center">
              {logoFile ? logoFile.name : "Drop images here"}
            </span>
            <span className="text-zinc-300 text-[10px] font-semibold font-['Poppins'] tracking-wide text-center">
              Support JPG, PNG, WEBP (Max 10MB)
            </span>
          </label>
        </section>

        {/* Reset / Confirm */}
        <div className={`flex flex-col items-center gap-3 pt-1 ${enter("delay-300")}`}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLocked}
            className="w-24 h-12 rounded-full outline outline-2 outline-offset-[-2px] outline-indigo-100 text-indigo-100 text-sm font-extrabold font-['Poppins'] hover:bg-slate-800/50 transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-transparent"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLocked || saving}
            className="flex items-center gap-2 px-7 h-12 bg-purple-300 rounded-full text-violet-900 text-sm font-normal font-['Poppins'] shadow-[0px_10px_15px_-3px_rgba(208,188,255,0.20)] hover:bg-purple-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
          >
            {saving ? "Saving..." : isLocked ? "Confirmed" : "Confirm"}
          </button>
        </div>
      </main>

      {activePlatform && (
        <SocialLinkModal
          platform={activePlatform}
          initialValue={socialLinks[activePlatform.id]}
          onSave={handleSaveSocialLink}
          onClose={() => setActiveSocialModal(null)}
        />
      )}
    </div>
  );
}