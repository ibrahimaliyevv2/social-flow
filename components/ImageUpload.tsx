"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  endpoint: "postImage"; // because of uploadthing
}

const ImageUpload = ({ endpoint, onChange, value }: ImageUploadProps) => {
  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover p-1"
        />
        <button
          onClick={() => onChange("")}
          type="button"
          className="absolute top-0 right-0 p-2 bg-red-500 rounded-full shadow-sm cursor-pointer"
        >
          <XIcon className="size-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};

export default ImageUpload;
