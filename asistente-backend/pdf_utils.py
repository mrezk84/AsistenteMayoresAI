import fitz  # PyMuPDF
import io


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extrae todo el texto de un archivo PDF.

    Args:
        pdf_bytes: Contenido del PDF en bytes.

    Returns:
        Texto extraído del PDF, página por página.
    """
    try:
        # Abrir el PDF desde bytes
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text()
            if page_text.strip():
                text_parts.append(page_text)

        doc.close()

        full_text = "\n\n".join(text_parts)

        if not full_text.strip():
            return "No se pudo extraer texto del PDF. El archivo puede contener solo imágenes."

        return full_text

    except Exception as e:
        raise ValueError(f"Error al procesar el PDF: {str(e)}")
