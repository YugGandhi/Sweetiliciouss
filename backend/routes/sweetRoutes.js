const express = require("express");
const router = express.Router();
const Sweet = require("../models/Sweet");
const multer = require("multer");

// Multer setup to store images in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (io) => {
  // ✅ Fetch all sweets (Return Image URLs instead of Binary Data)
  router.get("/", async (req, res) => {
    try {
      // Only fetch necessary fields, exclude photos.data
      const sweets = await Sweet.find({}, {
        name: 1,
        description: 1,
        quantity250g: 1,
        quantity500g: 1,
        quantity1kg: 1,
        price: 1,
        photos: 1 // Only fetch metadata, not binary data
      });

      // Convert binary images into URL format
      const formattedSweets = sweets.map(sweet => ({
        _id: sweet._id,
        name: sweet.name,
        description: sweet.description,
        quantity250g: sweet.quantity250g,
        quantity500g: sweet.quantity500g,
        quantity1kg: sweet.quantity1kg,
        price: sweet.price,
        photos: (sweet.photos || []).map((_, index) => `http://localhost:5001/api/sweets/image/${sweet._id}/${index}`)
      }));

      res.json(formattedSweets);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch sweets" });
    }
  });

  // ✅ Fetch a single sweet by ID
  router.get("/:id", async (req, res) => {
    try {
      const sweet = await Sweet.findById(req.params.id);
      if (!sweet) return res.status(404).json({ error: "Sweet not found" });

      // Convert image buffer into URL format
      const formattedSweet = {
        _id: sweet._id,
        name: sweet.name,
        description: sweet.description,
        quantity250g: sweet.quantity250g,
        quantity500g: sweet.quantity500g,
        quantity1kg: sweet.quantity1kg,
        price: sweet.price,
        photos: sweet.photos.map((_, index) => `http://localhost:5001/api/sweets/image/${sweet._id}/${index}`)
      };

      res.json(formattedSweet);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch sweet" });
    }
  });

  // ✅ Fetch an image by sweet ID and image index
  router.get("/image/:id/:index", async (req, res) => {
    try {
      console.log("Fetching image for sweet:", req.params.id, "index:", req.params.index);
      const sweet = await Sweet.findById(req.params.id);
      console.log("Sweet found:", !!sweet, "Photos length:", sweet?.photos?.length);
      if (!sweet || !sweet.photos.length || !sweet.photos[req.params.index]) {
        console.log("Image not found for sweet", req.params.id, "index", req.params.index);
        // Serve a static placeholder image
        return res.sendFile(require('path').resolve(__dirname, '../public/placeholder-image.jpg'));
      }

      res.set("Content-Type", sweet.photos[req.params.index].contentType);
      res.send(sweet.photos[req.params.index].data);
    } catch (err) {
      console.error("[IMAGE FETCH ERROR]", err);
      // Serve a static placeholder image on error
      return res.sendFile(require('path').resolve(__dirname, '../public/placeholder-image.jpg'));
    }
  });

  // ✅ Add a new sweet with images (Emit `sweetAdded` event)
  router.post("/", upload.array("photos", 3), async (req, res) => {
    try {
      console.log("[ADD SWEET] req.body:", req.body);
      console.log("[ADD SWEET] req.files:", req.files);
      const { name, quantity250g, quantity500g, quantity1kg, price, description } = req.body;

      const photos = req.files.map((file, index) => ({
        filename: `${Date.now()}-${index}.${file.mimetype.split("/")[1]}`,
        contentType: file.mimetype,
        data: file.buffer
      }));

      const newSweet = new Sweet({ name, quantity250g, quantity500g, quantity1kg, price, description, photos });
      await newSweet.save();

      // ✅ Emit WebSocket event
      io.emit("sweetAdded", {
        _id: newSweet._id,
        name: newSweet.name,
        description: newSweet.description,
        quantity250g: newSweet.quantity250g,
        quantity500g: newSweet.quantity500g,
        quantity1kg: newSweet.quantity1kg,
        price: newSweet.price,
        photos: newSweet.photos.map((_, index) => `http://localhost:5001/api/sweets/image/${newSweet._id}/${index}`)
      });

      res.status(201).json(newSweet);
    } catch (err) {
      console.error("[ADD SWEET ERROR]", err);
      res.status(400).json({ error: err.message || "Failed to add sweet" });
    }
  });

  // ✅ Update a sweet (Emit `sweetUpdated` event)
  router.put("/:id", upload.array("photos", 3), async (req, res) => {
    try {
      const { name, quantity250g, quantity500g, quantity1kg, price, description } = req.body;

      let updatedPhotos = [];
      if (req.files.length > 0) {
        updatedPhotos = req.files.map(file => ({
          data: file.buffer,
          contentType: file.mimetype
        }));
      }

      const updatedSweet = await Sweet.findByIdAndUpdate(
        req.params.id,
        { name, quantity250g, quantity500g, quantity1kg, price, description, photos: updatedPhotos.length ? updatedPhotos : undefined },
        { new: true }
      );

      if (!updatedSweet) return res.status(404).json({ error: "Sweet not found" });

      // ✅ Emit WebSocket event
      io.emit("sweetUpdated", {
        _id: updatedSweet._id,
        name: updatedSweet.name,
        description: updatedSweet.description,
        quantity250g: updatedSweet.quantity250g,
        quantity500g: updatedSweet.quantity500g,
        quantity1kg: updatedSweet.quantity1kg,
        price: updatedSweet.price,
        photos: updatedSweet.photos.map((_, index) => `http://localhost:5001/api/sweets/image/${updatedSweet._id}/${index}`)
      });

      res.json(updatedSweet);
    } catch (err) {
      res.status(500).json({ error: "Failed to update sweet" });
    }
  });

  // ✅ Delete a sweet (Emit `sweetDeleted` event)
  router.delete("/:id", async (req, res) => {
    try {
      await Sweet.findByIdAndDelete(req.params.id);

      // ✅ Emit WebSocket event
      io.emit("sweetDeleted", req.params.id);

      res.json({ message: "Sweet deleted" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete sweet" });
    }
  });

  // DEBUG: Fetch all sweets with just _id, name, and photoCount
  router.get("/debug", async (req, res) => {
    try {
      const sweets = await Sweet.find({}, { name: 1, photos: 1 });
      const debugData = sweets.map(sweet => ({
        _id: sweet._id,
        name: sweet.name,
        photoCount: sweet.photos ? sweet.photos.length : 0
      }));
      res.json(debugData);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch debug sweets" });
    }
  });

  // DEBUG: Log problematic sweets (bad or huge photos field)
  router.get("/debug-log", async (req, res) => {
    try {
      const sweets = await Sweet.find({}, { name: 1, photos: 1 });
      let issues = 0;
      sweets.forEach(sweet => {
        if (!Array.isArray(sweet.photos) || sweet.photos === null || sweet.photos === undefined) {
          console.log("[BAD PHOTOS FIELD]", sweet._id, sweet.name, sweet.photos);
          issues++;
        } else if (sweet.photos.length > 10) {
          console.log("[TOO MANY PHOTOS]", sweet._id, sweet.name, "photoCount:", sweet.photos.length);
          issues++;
        }
      });
      res.json({ message: `Scan complete. Problematic documents logged to server console. Issues found: ${issues}` });
    } catch (err) {
      res.status(500).json({ error: "Failed to scan sweets for issues" });
    }
  });

  // Update sweet stock (Admin only)
  router.put("/:id/stock", require("../middleware/auth"), async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { quantity250g, quantity500g, quantity1kg } = req.body;
      const sweet = await Sweet.findByIdAndUpdate(
        req.params.id,
        { quantity250g, quantity500g, quantity1kg },
        { new: true }
      );
      if (!sweet) {
        return res.status(404).json({ error: "Sweet not found" });
      }
      res.json(sweet);
    } catch (err) {
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  return router;
};
