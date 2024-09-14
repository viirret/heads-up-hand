import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_image(img_url, output_dir):
    img_name = os.path.basename(img_url)
    img_path = os.path.join(output_dir, img_name)
    
    # Set headers to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }

    response = requests.get(img_url, headers=headers)
    
    if response.status_code == 200:
        content_type = response.headers.get('Content-Type', '')
        print(f"Downloading {img_url} with content type {content_type}")
        
        if 'image/svg+xml' in content_type or 'image/png' in content_type:
            with open(img_path, 'wb') as f:
                f.write(response.content)
            print(f"Downloaded: {img_path}")
        else:
            print(f"Not an image: {img_url}")
    else:
        print(f"Failed to download image: {img_url} with status code {response.status_code}")

def get_image_urls(page_url):
    # Fetch the webpage content
    response = requests.get(page_url)
    if response.status_code != 200:
        print(f"Failed to retrieve the webpage: {response.status_code}")
        return []

    # Parse the webpage
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find all links to media files
    media_links = []
    for link in soup.find_all('a', href=True):
        href = link['href']
        if href.startswith('/wiki/File:') and ('English_pattern' in href) and (href.endswith('.svg')):
            media_url = urljoin('https://en.wikipedia.org', href)
            media_links.append(media_url)

    return media_links

def get_direct_image_urls(media_urls):
    direct_image_urls = []
    for media_url in media_urls:
        response = requests.get(media_url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            img_tag = soup.find('div', {'class': 'fullImageLink'}).find('a', href=True)
            img_url = urljoin('https://en.wikipedia.org', img_tag['href'])
            direct_image_urls.append(img_url)

    return direct_image_urls

def main():
    # Create a directory to store the downloaded images
    output_dir = 'static/cards'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # URL of the Wikipedia page with media files
    page_url = 'https://en.wikipedia.org/wiki/Standard_52-card_deck'

    # Fetch image URLs from the page
    media_urls = get_image_urls(page_url)
    direct_image_urls = get_direct_image_urls(media_urls)

    # Download each media file
    for image_url in direct_image_urls:
        download_image(image_url, output_dir)

    print("Download completed!")

if __name__ == "__main__":
    main()