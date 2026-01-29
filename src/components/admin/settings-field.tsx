// src/components/admin/settings-field.tsx
export function SettingsField({ setting }: { setting: any }) {
    const isBoolean = typeof setting.value === 'boolean';
    
    return (
      <div className="flex items-center justify-between border-b border-black py-6">
        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase tracking-[0.2em]">
            {setting.key.replace(/_/g, ' ')}
          </label>
          <p className="text-xs opacity-50 font-medium">{setting.description}</p>
        </div>
  
        <div className="w-1/3">
          {isBoolean ? (
            <button className={`w-12 h-6 border-2 border-black relative transition-colors ${setting.value ? 'bg-black' : 'bg-transparent'}`}>
              <div className={`absolute top-0.5 bottom-0.5 w-4 transition-all ${setting.value ? 'right-0.5 bg-white' : 'left-0.5 bg-black'}`} />
            </button>
          ) : (
            <input 
              type="text" 
              defaultValue={setting.value}
              className="w-full border-b border-black/20 focus:border-black outline-none py-2 text-sm font-mono"
            />
          )}
        </div>
      </div>
    );
  }