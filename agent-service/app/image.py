from app.agent import graph

try:
    # Generate the image
    image_data = graph.get_graph(xray=True).draw_mermaid_png()
    
    name = "graph_image.png"
    
    # Save the image to a file
    with open(name, "wb") as image_file:
        image_file.write(image_data)
    print("Image saved as " + name)
except Exception as e:
    # This requires some extra dependencies and is optional
    print(f"An error occurred: {e}")