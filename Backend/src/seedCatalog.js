import productModel from "./models/product.model.js";
import userModel from "./models/user.model.js";

const imageBase = "https://cdn.shopify.com/s/files/1/0420/7073/7058/files";

const photo = id => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

const catalog = [
    {
        catalogKey: "snitch-geometric-shirt",
        title: "Regular Fit Geometric Shirt",
        description: "A textured geometric print in a lightweight regular fit. Made for casual days that need a sharper finish.",
        amount: 1699,
        fit: "Regular Fit",
        image: `${imageBase}/4sfs159-01_1.jpg?v=1783444911`
    },
    {
        catalogKey: "snitch-double-pocket-oversized-shirt",
        title: "Double Pocket Oversized Shirt",
        description: "A clean off-white oversized shirt with dual chest pockets and a relaxed, easy-wearing silhouette.",
        amount: 1299,
        fit: "Oversized Fit",
        image: `${imageBase}/1_d7de745c-51b8-4f60-aecd-822417cda7bd.jpg?v=1784821703`
    },
    {
        catalogKey: "snitch-paisley-shirt",
        title: "Regular Fit Paisley Print Shirt",
        description: "An intricate paisley pattern on smooth viscose, designed to move from smart-casual plans to evenings out.",
        amount: 1199,
        fit: "Regular Fit",
        image: `${imageBase}/1_61d107a4-04c2-43f9-a557-daa4a9c886a5.jpg?v=1787920614`
    },
    {
        catalogKey: "snitch-cotton-checks-shirt",
        title: "100% Cotton Regular Fit Checks Shirt",
        description: "A timeless plaid shirt in breathable cotton with a classic spread collar and full sleeves.",
        amount: 1399,
        fit: "Regular Fit",
        image: `${imageBase}/1_ecfe1b37-1400-431a-9396-816aecbbbbce.jpg?v=1788165530`
    },
    {
        catalogKey: "snitch-floral-placement-shirt",
        title: "Box Fit Floral Placement Print Shirt",
        description: "A relaxed box fit with vibrant botanical artwork, green accents and a breezy Cuban collar.",
        amount: 1499,
        fit: "Box Fit",
        image: `${imageBase}/1_2fa1c54a-78d2-4c44-b7a3-59b9458a8d3c.jpg?v=1789039800`
    },
    {
        catalogKey: "snitch-stay-sunny-shirt",
        title: "Stay Sunny Placement Print Shirt",
        description: "Playful sun and fruit motifs meet a relaxed oversized fit in a lightweight, breathable fabric.",
        amount: 1499,
        fit: "Oversized Fit",
        image: `${imageBase}/1_c58c413c-65b0-4497-99d8-aaa73781c300.png?v=1790097314`
    },
    {
        catalogKey: "snitch-cotton-linen-checks-shirt",
        title: "Cotton Linen Checks Shirt",
        description: "A breathable cotton-linen blend in a classic check, with a versatile regular fit for everyday wear.",
        amount: 1799,
        fit: "Regular Fit",
        image: `${imageBase}/1_1d3d3ba1-b168-473f-becc-e1034fd4380a.jpg?v=1790342078`
    },
    {
        catalogKey: "snitch-teal-pinstripe-shirt",
        title: "Teal Pinstripe Regular Fit Shirt",
        description: "A soft teal pinstripe shirt with a chest pocket and button-down collar. Roll the sleeves and it works from campus to coffee.",
        amount: 1399,
        fit: "Regular Fit",
        image: photo("1589310243389-96a5483213a8")
    },
    {
        catalogKey: "snitch-yellow-check-flannel-shirt",
        title: "Yellow Check Oversized Flannel Shirt",
        description: "A brushed flannel in navy and mustard checks with twin flap pockets. Cut in an oversized fit to wear open over a tee.",
        amount: 1899,
        fit: "Oversized Fit",
        image: photo("1607345366928-199ea26cfe3e")
    },
    {
        catalogKey: "snitch-sky-blue-pinstripe-shirt",
        title: "Sky Blue Pinstripe Regular Fit Shirt",
        description: "A crisp sky blue pinstripe shirt with a sharp collar and a clean regular fit. Made for meetings that turn into dinners.",
        amount: 1599,
        fit: "Regular Fit",
        image: photo("1620012253295-c15cc3e65df4")
    },
    {
        catalogKey: "snitch-white-crown-shirt",
        title: "Classic White Crown Embroidered Shirt",
        description: "A breathable white cotton shirt with a small embroidered crown on the chest. Regular fit, easy to dress up or down.",
        amount: 1499,
        fit: "Regular Fit",
        image: photo("1621072156002-e2fccdc0b176")
    },
    {
        catalogKey: "snitch-tie-dye-gradient-shirt",
        title: "Tie-Dye Gradient Printed Shirt",
        description: "A hand-dyed gradient print in soft summer colours, cut in a relaxed oversized fit with a spread collar.",
        amount: 1699,
        fit: "Oversized Fit",
        image: photo("1626497764746-6dc36546b388")
    }
];

// demo products that were removed from the catalog; cleaned out of existing databases on seed
const retiredKeys = [ "snitch-chambray-heart-print-shirt" ];

export async function seedCatalog() {
    const seller = await userModel.findOneAndUpdate(
        { email: "demo-seller@snitch.local" },
        {
            $setOnInsert: {
                fullname: "SNITCH Demo Store",
                googleId: "snitch-demo-catalog",
                role: "seller"
            }
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    );

    await productModel.deleteMany({ catalogKey: { $in: retiredKeys } });

    let seededCount = 0;

    for (const item of catalog) {
        const result = await productModel.updateOne(
            { catalogKey: item.catalogKey },
            {
                $setOnInsert: {
                    title: item.title,
                    description: item.description,
                    seller: seller._id,
                    price: { amount: item.amount, currency: "INR" },
                    images: [{ url: item.image }],
                    variants: [ "XS", "S", "M", "L", "XL", "XXL" ].map(size => ({
                        stock: 12,
                        attributes: { Size: size, Fit: item.fit },
                        price: { amount: item.amount, currency: "INR" }
                    }))
                }
            },
            { upsert: true }
        );

        if (result.upsertedCount) seededCount += 1;
    }

    if (seededCount) {
        console.log(`Seeded ${seededCount} SNITCH-style products`);
    }
}