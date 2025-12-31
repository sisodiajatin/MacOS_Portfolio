import { WindowControls } from "#components";
import WindowWrapper from "../hoc/WIndowWrapper.jsx";
import useWindowStore from "#store/window.js";

const Image = () => {
    const { windows } = useWindowStore();
    const imageData = windows.imgfile?.data;

    if (!imageData) return null;

    const { name, imageUrl } = imageData;

    return (
        <>
            <div id="window-header">
                <WindowControls target="imgfile" />
                <h2>{name || "Image File"}</h2>
            </div>

            <div className="p-5 bg-white h-full flex items-center justify-center">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name || "Image"}
                        className="max-w-full max-h-full object-contain rounded"
                    />
                ) : null}
            </div>
        </>
    );
};

const ImageWindow = WindowWrapper(Image, "imgfile");

export default ImageWindow;
