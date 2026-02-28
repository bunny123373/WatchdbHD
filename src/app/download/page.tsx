import { Download } from "lucide-react";

export default function DownloadApp() {
  const apkUrl = "/TeluguDB.apk";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 text-center">
        <div className="w-24 h-24 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Download className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">TeluguDB App</h1>
        <p className="text-zinc-400 mb-6">
          Download our app for the best experience
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>4 MB</span>
          </div>
          
          <div className="bg-zinc-800 rounded-lg p-3 text-sm">
            <p className="text-zinc-400">Android 8.0+ required</p>
          </div>
        </div>

        <a
          href={apkUrl}
          download="TeluguDB.apk"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Download APK
        </a>

        <p className="text-xs text-zinc-500 mt-6">
          By downloading, you agree to install apps from unknown sources
        </p>
      </div>
    </div>
  );
}
