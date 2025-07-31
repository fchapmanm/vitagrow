// Lista local de vegetales básicos
const basicVegetables = [
  {
    id: 1,
    common_name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop'
    }
  },
  {
    id: 2,
    common_name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 3,
    common_name: 'Lettuce',
    scientific_name: 'Lactuca sativa',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop'
    }
  },
  {
    id: 4,
    common_name: 'Carrot',
    scientific_name: 'Daucus carota',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop'
    }
  },
  {
    id: 5,
    common_name: 'Coriander',
    scientific_name: 'Coriandrum sativum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 6,
    common_name: 'Parsley',
    scientific_name: 'Petroselinum crispum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 7,
    common_name: 'Scallions',
    scientific_name: 'Allium fistulosum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 8,
    common_name: 'Garlic',
    scientific_name: 'Allium sativum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 9,
    common_name: 'Spinach',
    scientific_name: 'Spinacia oleracea',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop'
    }
  },
  {
    id: 10,
    common_name: 'Kale',
    scientific_name: 'Brassica oleracea var. sabellica',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop'
    }
  },
  {
    id: 11,
    common_name: 'Mint',
    scientific_name: 'Mentha',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 12,
    common_name: 'Rosemary',
    scientific_name: 'Salvia rosmarinus',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 13,
    common_name: 'Thyme',
    scientific_name: 'Thymus vulgaris',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 14,
    common_name: 'Oregano',
    scientific_name: 'Origanum vulgare',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  },
  {
    id: 15,
    common_name: 'Bell Pepper',
    scientific_name: 'Capsicum annuum',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop'
    }
  },
  {
    id: 16,
    common_name: 'Cucumber',
    scientific_name: 'Cucumis sativus',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop'
    }
  },
  {
    id: 17,
    common_name: 'Zucchini',
    scientific_name: 'Cucurbita pepo',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop'
    }
  },
  {
    id: 18,
    common_name: 'Broccoli',
    scientific_name: 'Brassica oleracea var. italica',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop'
    }
  },
  {
    id: 19,
    common_name: 'Cauliflower',
    scientific_name: 'Brassica oleracea var. botrytis',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=200&h=200&fit=crop'
    }
  },
  {
    id: 20,
    common_name: 'Onion',
    scientific_name: 'Allium cepa',
    default_image: {
      thumbnail: 'https://images.unsplash.com/photo-1612392166889-8c0c6c73d5b8?w=200&h=200&fit=crop'
    }
  }
];

export async function fetchPlants(searchTerm: string) {
  try {
    // Si no hay término de búsqueda, devolver todas las plantas
    if (!searchTerm.trim()) {
      return basicVegetables;
    }
    
    // Filtrar vegetales basado en el término de búsqueda
    const filteredPlants = basicVegetables.filter(plant => 
      plant.common_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredPlants;
  } catch (error) {
    console.error('Error fetching plant data:', error);
    return [];
  }
}
