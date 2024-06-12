import { Request, Response } from "express";
import Post from "../models/Post";
import { Op } from "sequelize";


export const getAllPost = async (req: Request, res: Response) => {
    try {
      const search = req.query.search || ""
      const post_date = req.query.post_date || "DESC"
      let platform:any = req.query.platform || []

      if(platform.length !== 0){
        platform = platform.toString().split(",")
      }

      let db_page = req.query.page || 1
      let db_limit = req.query.limit || 20

      const POST = await Post.findAll({
        attributes:{exclude:["createdAt", "updatedAt"]},
        limit: +db_limit,
        offset: (+db_page - 1) * +db_limit,
        order: [["post_date", post_date.toString()]],
      })


      let filtered_data = POST.filter(post => {
        let post_json = post.toJSON()
        const matchesSearch = post_json.title.toLowerCase().includes(search.toString().toLowerCase()) || post_json.company.toLowerCase().includes(search.toString().toLowerCase()) || post_json.location.toLowerCase().includes(search.toString().toLowerCase());
        const matchesPlatform = platform.length !== 0 ? platform.includes(post.platform.toString().toLowerCase()) : true
        
        return matchesSearch && matchesPlatform
      })

      const total_entries = filtered_data.length;
      const total_pages = Math.ceil(total_entries / +db_limit);

      return res.status(200).json({
        limit: db_limit,
        page: db_page,
        total_page: total_pages,
        datas: filtered_data
      })
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

export const getThreePost = async (req: Request, res: Response) => {
    try {
      const POST = await Post.findAll({
        attributes:{exclude:["createdAt", "updatedAt"]},
        limit: 3,
        order: [["post_date", "DESC"]],
      })

      return res.status(200).json(POST)
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

export const getAllPostCount = async (req: Request, res: Response) => {
    try {
      const POST = await Post.count()
      return res.status(200).json(POST)
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
};

export const addPost = async (req: Request, res: Response) => {
  const postData = req.body; // Data pembaruan pengguna dari permintaan PUT  

  try {
    await Post.create(postData)    
    return res.sendStatus(201)
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePosts = async (req: Request, res: Response) => {
  const postId = req.params.id;
  const updatedPost = req.body; // Data pembaruan pengguna dari permintaan PUT  

  try {
    const post = await Post.findByPk(postId);
    if (post) {
      await post.update(updatedPost);
      return res.sendStatus(200)
    } else {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const DeletePost = async (req: Request, res: Response) => {
  const postId = req.params.id
  const POST = await Post.findByPk(postId)
  
  try{
    if (POST) {
      POST.destroy()
      return res.sendStatus(200)
    } else {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};