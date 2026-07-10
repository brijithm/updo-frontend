import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { saveBrandSettings, getMyBrands, uploadBrandLogo } from "../services/brandService";
import facebookIcon from "../assets/Facebook.svg";
import linkedinIcon from "../assets/LinkedIn.svg";
import instagramIcon from "../assets/Instagram.svg";
import twitterIcon from "../assets/X.svg";

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

function SocialButton({ platform, connected, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex flex-col items-center gap-2 px-6 py-4 bg-slate-900 rounded-xl hover:-translate-y-0.5 transition-transform disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      <img src={platform.icon} alt={platform.label} className="w-8 h-8 opacity-70" />
      <div className="text-zinc-300 text-sm font-medium font-['Poppins']">{platform.label}</div>
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
  tagline: "",
  website: "",
  phone: "",
};

const EMPTY_SOCIALS = { facebook: "", linkedin: "", instagram: "", twitter: "" };
const EMPTY_COLORS = { primary: "", secondary: "", accent: "" };

export default function BrandSettings() {
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
        Niche: form.Niche,
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
    <div className="min-h-screen w-full bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-14 pb-16 flex flex-col gap-2">
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
                name="Niche"
                value={form.Niche}
                onChange={handleFieldChange}
                disabled={isLocked}
                placeholder="e.g. Hotels, Digital Marketing, Fitness"
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