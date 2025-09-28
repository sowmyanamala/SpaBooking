import React, { useState } from "react";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const image = e.target.files[0];
    setImage(image);
    setPreviewUrl(URL.createObjectURL(image));
  };

  const handleUpload = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    fetch("https://tsm.spagram.com/api/testfileuploader.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data.error) {
          setError(data.error);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error.message);
      });
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
      {isLoading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
      {previewUrl && <img src={previewUrl} alt="Preview" />}
    </div>
  );
};

export default ImageUpload;
